import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SessionComponent} from './session/session.component';
import {SessionRoutingModule} from './session-routing.module';
import {SharedModule} from '../../shared/shared.module';
import {ParticipantsListComponent} from './participants-list/participants-list.component';
import {TooltipModule} from 'primeng/tooltip';
import {BadgeModule} from 'primeng/badge';
import {InputSwitchModule} from 'primeng/inputswitch';
import {SliderModule} from 'primeng/slider';
import {DropdownModule} from 'primeng/dropdown';
import {OrderListModule} from 'primeng/orderlist';
import {GoalsComponent} from './goals/goals.component';


@NgModule({
    declarations: [
        SessionComponent,
        ParticipantsListComponent,
        GoalsComponent,
    ],
    imports: [
        SessionRoutingModule,
        CommonModule,
        SharedModule,
        TooltipModule,
        BadgeModule,
        InputSwitchModule,
        SliderModule,
        DropdownModule,
        OrderListModule,
    ]
})
export class SessionModule {
}
