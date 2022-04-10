import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {RippleModule} from 'primeng/ripple';
import {InputNumberModule} from 'primeng/inputnumber';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';


@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        ButtonModule,
        InputTextModule,
        RippleModule,
        InputNumberModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    exports: [
        ButtonModule,
        InputTextModule,
        RippleModule,
        InputNumberModule,
        FormsModule,
        ReactiveFormsModule,
    ]
})
export class SharedModule {
}
