import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
    selector: 'app-participants-list',
    templateUrl: './participants-list.component.html',
    styleUrls: ['./participants-list.component.scss']
})
export class ParticipantsListComponent implements OnInit {

    @Input()
    participants: FormControl | undefined;

    constructor() {
    }

    ngOnInit(): void {
    }

    onAddParticipantSubmit(e: SubmitEvent, newParticipant: HTMLInputElement): void {
        this.participants?.value.push(newParticipant.value.trim());
        this.participants?.updateValueAndValidity();
        newParticipant.value = '';
        e.preventDefault();
    }
}
