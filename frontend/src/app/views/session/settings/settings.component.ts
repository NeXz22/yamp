import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {SessionSettings} from '../shared/session-settings';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

    @Output()
    settingsChangedEvent: EventEmitter<SessionSettings> = new EventEmitter<SessionSettings>();
    @Input()
    settingsForm: FormGroup | undefined;

    get sessionSettings(): FormGroup {
        return this.settingsForm?.get('sessionSettings') as FormGroup;
    }

    get userSpecificSettings(): FormGroup {
        return this.settingsForm?.get('userSettings') as FormGroup;
    }

    constructor() {
    }

    ngOnInit(): void {

    }

}
