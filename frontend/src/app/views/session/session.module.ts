import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SessionComponent} from './session/session.component';
import {SessionRoutingModule} from './session-routing.module';
import {SharedModule} from '../../shared/shared.module';
import {ParticipantsListComponent} from './participants-list/participants-list.component';
import {CountdownComponent} from './countdown/countdown.component';
import {SettingsComponent} from './settings/settings.component';


@NgModule({
    declarations: [
        SessionComponent,
        ParticipantsListComponent,
        CountdownComponent,
        SettingsComponent
    ],
    imports: [
        SessionRoutingModule,
        CommonModule,
        SharedModule,

    ]
})
export class SessionModule {
}
