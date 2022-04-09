import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SessionComponent} from './session/session.component';
import {SessionRoutingModule} from './session-routing.module';


@NgModule({
    declarations: [
        SessionComponent
    ],
    imports: [
        SessionRoutingModule,
        CommonModule
    ]
})
export class SessionModule {
}
