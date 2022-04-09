import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HeaderComponent} from './header/header.component';
import {FooterComponent} from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import {ButtonModule} from 'primeng/button';


@NgModule({
    declarations: [
        HeaderComponent,
        FooterComponent,
        HomeComponent,
        PageNotFoundComponent,
    ],
    exports: [
        HeaderComponent,
        FooterComponent
    ],
    imports: [
        CommonModule,
        ButtonModule,
    ]
})
export class CoreModule {
}
