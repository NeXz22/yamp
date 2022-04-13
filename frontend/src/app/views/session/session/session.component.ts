import {Component, OnInit} from '@angular/core';
import {io, Socket} from "socket.io-client";
import {SocketConnectionStatus} from '../shared/SocketConnectionStatus';
import {ActivatedRoute, Router} from '@angular/router';
import {debounceTime, first, Observable, of, Subscription, switchMap, timer} from 'rxjs';
import {SessionSettings} from '../shared/session-settings';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import * as _ from 'lodash';

@Component({
    selector: 'app-session',
    templateUrl: './session.component.html',
    styleUrls: ['./session.component.scss']
})
export class SessionComponent implements OnInit {

    socketConnectionStatus: SocketConnectionStatus = SocketConnectionStatus.CONNECTING;
    urlToShare = '';
    private sessionName: string = '';
    private socket!: Socket;
    settingsForm!: FormGroup;
    userInputTimeInMilliSeconds: number = 0;

    private timerObservable: Observable<number> | undefined;
    private timerSubscription: Subscription | null = null;
    currentCountdownValue: number = 0;

    get sessionSettings(): FormGroup {
        return this.settingsForm.get('sessionSettings') as FormGroup;
    }

    get userSpecificSettings(): FormGroup {
        return this.settingsForm.get('userSettings') as FormGroup;
    }

    get inputMinutes(): FormControl {
        return this.sessionSettings.get('inputMinutes') as FormControl;
    }

    get inputSeconds(): FormControl {
        return this.sessionSettings.get('inputSeconds') as FormControl;
    }

    get participants(): FormControl {
        return this.sessionSettings.get('participants') as FormControl;
    }

    get countdownRunning(): FormControl {
        return this.sessionSettings.get('countdownRunning') as FormControl;
    }

    get countdownStartedAt(): FormControl {
        return this.sessionSettings.get('countdownStartedAt') as FormControl;
    }

    get timePassedSinceTimerStart(): FormControl {
        return this.sessionSettings.get('timePassedSinceTimerStart') as FormControl;
    }


    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder
    ) {
    }


    ngOnInit(): void {
        this.settingsForm = this.formBuilder.group({
            sessionSettings: this.formBuilder.group({
                sessionId: new FormControl(null, []),
                inputMinutes: new FormControl(10, []),
                inputSeconds: new FormControl(0, []),
                participants: new FormControl([], []),
                countdownRunning: new FormControl(false, []),
                countdownStartedAt: new FormControl(null, []),
                timePassedSinceTimerStart: new FormControl(null, []),
                useNavigatorRole: new FormControl(true, []),
            }),
            userSettings: this.formBuilder.group({})
        });

        this.route.queryParams.pipe(first()).subscribe({
            next: params => {
                this.sessionName = params['id'];
                if (!this.sessionName) {
                    console.error('~Client: No Session-ID provided. Redirecting...');
                    this.router.navigate(['']).then();
                }
            },
            error: () => {
                console.error(' ~Client: Could not retrieve Session-ID. Redirecting...');
                this.router.navigate(['']).then();
            },
            complete: () => {
                this.sessionSettings.get('sessionId')?.patchValue(this.sessionName, {emitEvent: false});
            }
        });

        this.setCountdown();

        this.settingsForm.get('sessionSettings')!.valueChanges
            .pipe(debounceTime(0), switchMap((settingsChangedEvent) => of(settingsChangedEvent)))
            .subscribe({
                next: () => {
                    this.emitUpdatedSessionSettings(this.sessionSettings.value);
                },
            })

        this.urlToShare = window.location.href;

        this.establishServerConnection();
    }

    private establishServerConnection(): void {
        this.socket = io("http://localhost:4444");

        this.socket.on("connect", () => {
            console.log(`~Server: Connected to Socket. User-ID: [${this.socket.id}].`);
            this.socketConnectionStatus = SocketConnectionStatus.ESTABLISHED;
            this.socket.emit('join session by name', this.sessionName, () => {
            });
            console.log(`~Client: Joining Session [${this.sessionName}].`);
        });

        this.socket.on("disconnect", (reason) => {
            this.socketConnectionStatus = SocketConnectionStatus.FAILED;
            console.log(`~Server: Disconnected from Socket. Reason: ${reason}.`);
        });

        this.socket.on('message to all users', (message: string) => {
            console.log(`~Server: ${message}`);
        });

        this.socket.on('sync sessionSettings', (updatedSessionSettings: SessionSettings) => {
            console.log(`~Server: Updated SessionSettings received:`);
            console.log(updatedSessionSettings);
            this.sessionSettings.patchValue(updatedSessionSettings, {emitEvent: false});
            this.setCountdown();
            this.updateUserInputTimeInMilliSeconds();
        });

        this.socket.on('settings for joined session exist', (settingsAlreadyExisting: SessionSettings) => {
            console.log(`~Server: Settings for joined session already exist:`);
            console.log(settingsAlreadyExisting);
            this.sessionSettings.patchValue(settingsAlreadyExisting, {emitEvent: false});
            this.setCountdown();
        });
    }

    copyToClipboard(toCopy: string): void {
        navigator.clipboard.writeText(toCopy).then();
    }

    emitUpdatedSessionSettings(updatedSessionSettings: SessionSettings): void {
        this.socket.emit('sessionSettings updated', updatedSessionSettings, () => {
        });
    }

    updateUserInputTimeInMilliSeconds(): void {
        this.userInputTimeInMilliSeconds = +this.inputMinutes.value * 60000 + +this.inputSeconds.value * 1000;
    }

    onStartCountdown(): void {
        this.sessionSettings.patchValue({countdownStartedAt: Date.now(), countdownRunning: true});
        this.setCountdown();
    }

    // called after onInit or after joining-session or session-settings-update or stop/start-countdown
    setCountdown(): void {
        // (re)-set countdown to display
        this.currentCountdownValue = this.inputMinutes.value * 60000 + this.inputSeconds.value * 1000;

        if (this.countdownRunning.value) {
            this.startCountdown();
        } else {
            this.stopCountdown();
        }
    }

    startCountdown(): void {
        if (!this.timerSubscription) {
            console.log('timerSubscription not existing');
            this.timerObservable = timer(0, 100);
            this.timerSubscription = this.timerObservable
                .subscribe(() => {
                    const timePassedSinceTimerStart = Date.now() - this.countdownStartedAt.value;
                    const desiredCountdownTime = this.inputMinutes.value * 60000 + this.inputSeconds.value * 1000;
                    this.currentCountdownValue = desiredCountdownTime - timePassedSinceTimerStart;

                    if (this.currentCountdownValue <= 0) {
                        this.onStopCountdown();
                    }
                });
        }
    }

    onStopCountdown(): void {
        this.countdownRunning.patchValue(false);
        this.stopCountdown();
    }

    stopCountdown(): void {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
            this.timerSubscription = null;
        }
    }

    formatMilliSecondsToCountdownString(milliSecondsToConvert: number): string {
        if (milliSecondsToConvert <= 0) {
            return '00:00';
        }
        const seconds = Math.floor((milliSecondsToConvert / 1000)) % 60;
        const minutes = Math.floor((milliSecondsToConvert / 60000)) % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    onShuffleParticipants(): void {
        this.participants.patchValue(_.shuffle(this.participants.value));
    }
}
