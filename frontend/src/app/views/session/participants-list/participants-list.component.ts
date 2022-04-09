import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-participants-list',
    templateUrl: './participants-list.component.html',
    styleUrls: ['./participants-list.component.scss']
})
export class ParticipantsListComponent implements OnInit {
    participants: string[] = [];

    constructor() {
    }

    ngOnInit(): void {
    }

    onAddParticipantSubmit(e: SubmitEvent, newParticipant: HTMLInputElement): void {
        this.participants.push(newParticipant.value.trim());
        newParticipant.value = '';
        e.preventDefault();
    }
}
