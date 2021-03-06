import {Component, OnInit} from '@angular/core';
import {io, Socket} from "socket.io-client";
import {SocketConnectionStatus} from '../shared/SocketConnectionStatus';
import {ActivatedRoute, Router} from '@angular/router';
import {debounceTime, first, Observable, of, Subscription, switchMap, timer} from 'rxjs';
import {SessionSettings} from '../shared/session-settings';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import * as _ from 'lodash';
import * as FileSaver from 'file-saver';
import {SessionService} from '../../../shared/session.service';
import {environment} from '../../../../environments/environment';

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

    private timerObservable: Observable<number> | undefined;
    private timerSubscription: Subscription | null = null;
    currentCountdownValue: number = 0;

    sounds: { name: string, src: string }[] = [
        {name: 'announcement', src: 'announcement-sound-4-21464.mp3'},
        {name: 'glass-breaking', src: 'glass-breaking-93803.mp3'},
        {name: 'metal-design-explosion', src: 'metal-design-explosion-13491.mp3'},
        {name: 'surprise', src: 'surprise-sound-effect-99300.mp3'},
        {name: 'swoosh', src: 'clean-fast-swooshaiff-14784.mp3'},
        {name: 'whoosh', src: 'whoosh-6316.mp3'},
    ];

    get sessionSettings(): FormGroup {
        return this.settingsForm.get('sessionSettings') as FormGroup;
    }

    get userSpecificSettings(): FormGroup {
        return this.settingsForm.get('userSettings') as FormGroup;
    }

    get sessionId(): FormControl {
        return this.sessionSettings.get('sessionId') as FormControl;
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

    get countdownStoppedAt(): FormControl {
        return this.sessionSettings.get('countdownStoppedAt') as FormControl;
    }

    get useNavigatorRole(): FormControl {
        return this.sessionSettings.get('useNavigatorRole') as FormControl;
    }

    get useGoals(): FormControl {
        return this.sessionSettings.get('useGoals') as FormControl;
    }

    get goals(): FormControl {
        return this.sessionSettings.get('goals') as FormControl;
    }

    get selectedSound(): FormControl {
        return this.userSpecificSettings.get('selectedSound') as FormControl;
    }

    get audioVolume(): FormControl {
        return this.userSpecificSettings.get('audioVolume') as FormControl;
    }

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private sessionService: SessionService,
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
                countdownStoppedAt: new FormControl(null, []),
                useNavigatorRole: new FormControl(false, []),
                useGoals: new FormControl(false, []),
                goals: new FormControl([], []),
            }),
            userSettings: this.formBuilder.group({
                selectedSound: new FormControl(this.sounds[0], []),
                audioVolume: new FormControl(50, []),
            })
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
                this.sessionId.patchValue(this.sessionName, {emitEvent: false});
                if (this.sessionService.storedSessionSettings) {
                    this.sessionSettings.patchValue(this.sessionService.storedSessionSettings);
                }
            }
        });

        this.setCountdown();

        this.sessionSettings.valueChanges
            .pipe(debounceTime(100), switchMap((settingsChangedEvent) => of(settingsChangedEvent)))
            .subscribe({
                next: () => {
                    this.emitUpdatedSessionSettings(this.sessionSettings.getRawValue());
                },
            })

        this.inputMinutes.valueChanges
            .subscribe({
                next: () => {
                    this.sessionSettings.patchValue({countdownStartedAt: null, countdownStoppedAt: null});
                }
            })

        this.inputSeconds.valueChanges
            .subscribe({
                next: () => {
                    this.sessionSettings.patchValue({countdownStartedAt: null, countdownStoppedAt: null});
                }
            })

        this.urlToShare = window.location.href;

        this.establishServerConnection();
    }

    private establishServerConnection(): void {
        this.socket = io(environment.serverHost);

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
            this.enableDisableTimeInputs();
            this.setCountdown();
        });

        this.socket.on('settings for joined session exist', (settingsAlreadyExisting: SessionSettings) => {
            console.log(`~Server: Settings for joined session already exist:`);
            console.log(settingsAlreadyExisting);
            this.sessionSettings.patchValue(settingsAlreadyExisting, {emitEvent: false});
            this.enableDisableTimeInputs();
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

    onStartCountdown(): void {
        if (this.countdownStoppedAt.value) {
            this.sessionSettings.patchValue({
                countdownStartedAt: Date.now() - (+this.inputMinutes.value * 60000 + +this.inputSeconds.value * 1000 - this.currentCountdownValue),
                countdownRunning: true,
                countdownStoppedAt: null
            });
        } else {
            this.sessionSettings.patchValue({countdownStartedAt: Date.now(), countdownRunning: true});
        }
        this.setCountdown();
    }

    setCountdown(): void {
        if (this.countdownStoppedAt.value) {
            this.currentCountdownValue = (this.inputMinutes.value * 60000 + this.inputSeconds.value * 1000) - (this.countdownStoppedAt.value - this.countdownStartedAt.value);
        } else {
            this.currentCountdownValue = this.inputMinutes.value * 60000 + this.inputSeconds.value * 1000;
        }

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
                        this.playSelectedSound();
                        this.moveOnParticipants();
                        this.onStopCountdown();
                    }
                });
        }
    }

    onStopCountdown(): void {
        this.stopCountdown();
        this.sessionSettings.patchValue({countdownRunning: false, countdownStoppedAt: Date.now()});
    }

    stopCountdown(): void {
        if (this.currentCountdownValue <= 0) {
            this.currentCountdownValue = this.inputMinutes.value * 60000 + this.inputSeconds.value * 1000;
        }
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
            this.timerSubscription = null;
        }
    }

    onResetCountdown(): void {
        if (this.countdownRunning.value) {
            this.onStopCountdown();
        }
        this.sessionSettings.patchValue({countdownRunning: false, countdownStartedAt: null, countdownStoppedAt: null});
        this.currentCountdownValue = this.inputMinutes.value * 60000 + this.inputSeconds.value * 1000;
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

    private enableDisableTimeInputs(): void {
        if (this.countdownRunning.value) {
            this.inputMinutes.disable({emitEvent: false});
            this.inputSeconds.disable({emitEvent: false});
        } else {
            this.inputMinutes.enable({emitEvent: false});
            this.inputSeconds.enable({emitEvent: false});
        }
    }

    playSelectedSound(): void {
        const audio = new Audio();
        audio.src = '../../../assets/sounds/' + this.selectedSound.value.src;
        audio.volume = this.audioVolume.value / 100;
        audio.load();
        audio.play()
            .then()
            .catch(reason => {
                console.log(reason);
            })
    }

    private moveOnParticipants(): void {
        let participants: string[] = this.participants.value;

        if (participants.length) {
            var first = participants.splice(0, 1);
            participants.push(first[0]);
        } else {
            participants = [];
        }

        this.participants.patchValue(participants, {emitEvent: false});
    }

    onDownloadSession(): void {
        const fileName = 'yamp-session_' + new Date().toTimeString() + '.txt';
        let currentSessionSettings: SessionSettings = this.sessionSettings.value;
        currentSessionSettings.countdownRunning = false;
        currentSessionSettings.countdownStoppedAt = null;
        currentSessionSettings.countdownStartedAt = null;
        const blob = new Blob([JSON.stringify(currentSessionSettings)], {type: "text/plain;charset=utf-8"});
        FileSaver.saveAs(blob, fileName);
    }
}
