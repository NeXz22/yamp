import {Component, OnInit} from '@angular/core';
import {io, Socket} from "socket.io-client";
import {SocketConnectionStatus} from '../shared/SocketConnectionStatus';
import {ActivatedRoute, Router} from '@angular/router';
import {debounceTime, first, Observable, of, Subscription, switchMap} from 'rxjs';
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

    countdownToDisplay = '';
    private timerObservable: Observable<number> | undefined;
    private timerSubscription: Subscription | undefined;

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
                countdownStartedAt: new FormControl(false, []),
                timePassedSinceTimerStart: new FormControl(false, []),
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
            this.socket.emit('join session by name', this.sessionName, () => {});
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
            this.countdownToDisplay = this.formatMilliSecondsToCountdownString(this.userInputTimeInMilliSeconds);
            this.updateUserInputTimeInMilliSeconds();
        });

        this.socket.on('settings for joined session exist', (settingsAlreadyExisting: SessionSettings) => {
            console.log(`~Server: Settings for joined session already exist:`);
            console.log(settingsAlreadyExisting);
            this.sessionSettings.patchValue(settingsAlreadyExisting, {emitEvent: false});
        });
    }

    copyToClipboard(toCopy: string): void {
        navigator.clipboard.writeText(toCopy).then();
    }

    emitUpdatedSessionSettings(updatedSessionSettings: SessionSettings): void {
        this.socket.emit('sessionSettings updated', updatedSessionSettings, () => {});
    }

    updateUserInputTimeInMilliSeconds(): void {
        this.userInputTimeInMilliSeconds = +this.inputMinutes.value * 60000 + +this.inputSeconds.value * 1000;
    }

    // onStartCountdown(emitEvent: boolean): void {
    //     this.countdownRunning?.patchValue(true, {emitEvent: emitEvent});
    //     this.countdownStartedAt.patchValue(Date.now() - this.timePassedSinceTimerStart.value);
    //     this.countdownToDisplay = this.formatMilliSecondsToCountdownString(this.userInputTimeInMilliSeconds - this.timePassedSinceTimerStart.value);
    //     this.timerObservable = timer(0, 100);
    //     this.timerSubscription = this.timerObservable.subscribe(() => {
    //         this.timePassedSinceTimerStart.patchValue(Date.now() - this.countdownStartedAt.value, {emitEvent: false});
    //         this.countdownToDisplay = this.formatMilliSecondsToCountdownString(this.userInputTimeInMilliSeconds - this.timePassedSinceTimerStart.value);
    //         if (this.timePassedSinceTimerStart.value >= this.userInputTimeInMilliSeconds) {
    //             this.timePassedSinceTimerStart.patchValue(0, {emitEvent: false});
    //             this.onStopCountdown(false);
    //         }
    //     });
    // }
    //
    // onStopCountdown(emitEvent: boolean): void {
    //     this.countdownRunning?.patchValue(false, {emitEvent: emitEvent});
    //     this.timerSubscription!.unsubscribe();
    // }
    //
    // onResetCountdown(emitEvent: boolean) {
    //     this.onStopCountdown(emitEvent);
    //     this.timePassedSinceTimerStart.patchValue(0);
    //     this.countdownToDisplay = this.formatMilliSecondsToCountdownString(this.userInputTimeInMilliSeconds);
    // }

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
