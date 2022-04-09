import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SessionComponent} from './session/session.component';
import {SessionRoutingModule} from './session-routing.module';
import {SharedModule} from '../../shared/shared.module';
import { ParticipantsListComponent } from './participants-list/participants-list.component';


@NgModule({
    declarations: [
        SessionComponent,
        ParticipantsListComponent
    ],
    imports: [
        SessionRoutingModule,
        CommonModule,
        SharedModule,
    ]
})
export class SessionModule {
}
