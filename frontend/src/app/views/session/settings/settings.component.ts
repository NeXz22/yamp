import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

    @Output()
    settingsChangedEvent: EventEmitter<any> = new EventEmitter<any>();
    settingsForm!: FormGroup;

    get sessionSettings(): FormGroup {
        return this.settingsForm.get('sessionSettings') as FormGroup;
    }

    get userSpecificSettings(): FormGroup {
        return this.settingsForm.get('userSpecificSettings') as FormGroup;
    }

    constructor(
        private formBuilder: FormBuilder,
    ) {
    }

    ngOnInit(): void {
        this.settingsForm = this.formBuilder.group({
            sessionSettings: this.formBuilder.group({
                inputMinutes: new FormControl(0, []),
                inputSeconds: new FormControl(0, []),
            }),
            userSpecificSettings: this.formBuilder.group({

            })
        });

        this.settingsForm.get('sessionSettings')!.valueChanges.subscribe({
            next: () => this.settingsChangedEvent.emit(),
        })
    }

}
