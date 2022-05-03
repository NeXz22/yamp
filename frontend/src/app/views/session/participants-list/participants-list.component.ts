import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import * as _ from 'lodash';

@Component({
    selector: 'app-participants-list',
    templateUrl: './participants-list.component.html',
    styleUrls: ['./participants-list.component.scss']
})
export class ParticipantsListComponent implements OnInit {

    @Input()
    participants: FormControl | undefined;
    selectedParticipants: any[] = [];

    @Input()
    useNavigatorRole: boolean = true;

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

    isFirstInParticipantsList(participant: string): boolean {
        return _.indexOf(this.participants?.value, participant) === 0;
    }

    isSecondInParticipantsList(participant: string): boolean {
        return _.indexOf(this.participants?.value, participant) === 1;
    }

    onReorderParticipants(): void {
        this.participants?.patchValue(this.participants?.value);
    }

    onRemoveParticipant(participant: string): void {
        this.selectedParticipants = [];
        this.participants?.patchValue(_.without(this.participants?.value, participant));
    }
}
