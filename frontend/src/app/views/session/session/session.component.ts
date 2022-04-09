import {Component, OnInit} from '@angular/core';
import {io} from "socket.io-client";
import {SocketConnectionStatus} from '../shared/SocketConnectionStatus';
import {ActivatedRoute, Router} from '@angular/router';
import {first} from 'rxjs';

@Component({
    selector: 'app-session',
    templateUrl: './session.component.html',
    styleUrls: ['./session.component.scss']
})
export class SessionComponent implements OnInit {

    socketConnectionStatus: SocketConnectionStatus = SocketConnectionStatus.CONNECTING;
    urlToShare = '';
    private sessionName: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
    ) {
    }

    ngOnInit(): void {
        this.route.queryParams.pipe(first()).subscribe({
            next: params => {
                this.sessionName = params['id'];
                if (!this.sessionName) {
                    console.error('No Session-ID provided. Redirecting...');
                    this.router.navigate(['']).then();
                }
            },
            error: () => {
                console.error('Could not retrieve Session-ID. Redirecting...');
                this.router.navigate(['']).then();
            }
        });

        this.urlToShare = window.location.href;

        this.establishServerConnection();
    }

    private establishServerConnection(): void {
        const socket = io("http://localhost:4444");

        socket.on("connect", () => {
            this.socketConnectionStatus = SocketConnectionStatus.ESTABLISHED;
            console.log(`Connected to Socket. User-ID: ${socket.id}.`);
        });

        socket.on("disconnect", () => {
            this.socketConnectionStatus = SocketConnectionStatus.FAILED;
            console.log(`Disconnected from Socket. User-ID: ${socket.id}.`);
        });
    }

    copyToClipboard(toCopy: string): void {
        navigator.clipboard.writeText(toCopy).then();
    }
}
