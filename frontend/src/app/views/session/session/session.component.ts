import {Component, OnInit} from '@angular/core';
import {io} from "socket.io-client";
import {SocketConnectionStatus} from '../shared/SocketConnectionStatus';

@Component({
    selector: 'app-session',
    templateUrl: './session.component.html',
    styleUrls: ['./session.component.scss']
})
export class SessionComponent implements OnInit {

    socketConnectionStatus: SocketConnectionStatus = SocketConnectionStatus.CONNECTING;

    constructor() {
    }

    ngOnInit(): void {
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

}
