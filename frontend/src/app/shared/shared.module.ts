import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {RippleModule} from 'primeng/ripple';
import {InputNumberModule} from 'primeng/inputnumber';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AvatarModule} from 'primeng/avatar';


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
        AvatarModule,
    ],
    exports: [
        ButtonModule,
        InputTextModule,
        RippleModule,
        InputNumberModule,
        FormsModule,
        ReactiveFormsModule,
        AvatarModule,
    ]
})
export class SharedModule {
}
