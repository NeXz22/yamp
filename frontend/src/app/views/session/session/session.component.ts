import {Component, OnInit} from '@angular/core';
import {io, Socket} from "socket.io-client";
import {SocketConnectionStatus} from '../shared/SocketConnectionStatus';
import {ActivatedRoute, Router} from '@angular/router';
import {debounceTime, first, of, switchMap} from 'rxjs';
import {SessionSettings} from '../shared/session-settings';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';

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

    get sessionSettings(): FormGroup {
        return this.settingsForm.get('sessionSettings') as FormGroup;
    }

    get userSpecificSettings(): FormGroup {
        return this.settingsForm.get('userSettings') as FormGroup;
    }

    get participants(): FormControl {
        return this.sessionSettings.get('participants') as FormControl;
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
                inputMinutes: new FormControl(0, []),
                inputSeconds: new FormControl(0, []),
                participants: new FormControl([], []),
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

        this.urlToShare = window.location.href;

        this.establishServerConnection();

        this.settingsForm.get('sessionSettings')!.valueChanges
            .pipe(debounceTime(0), switchMap((settingsChangedEvent) => of(settingsChangedEvent)))
            .subscribe({
                next: () => {
                    this.sendUpdatedSessionSettings(this.sessionSettings.value);
                },
            })
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
        });
    }

    copyToClipboard(toCopy: string): void {
        navigator.clipboard.writeText(toCopy).then();
    }

    sendUpdatedSessionSettings(updatedSessionSettings: SessionSettings): void {
        this.socket.emit('sessionSettings updated', updatedSessionSettings, () => {});
    }
}
