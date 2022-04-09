import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {RippleModule} from 'primeng/ripple';


@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        ButtonModule,
        InputTextModule,
        RippleModule,
    ],
    exports: [
        ButtonModule,
        InputTextModule,
        RippleModule,
    ]
})
export class SharedModule {
}
