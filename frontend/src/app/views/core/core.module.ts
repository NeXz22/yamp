import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HeaderComponent} from './header/header.component';
import {FooterComponent} from './footer/footer.component';
import {HomeComponent} from './home/home.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {SharedModule} from '../../shared/shared.module';
import {FormsModule} from '@angular/forms';
import {TooltipModule} from 'primeng/tooltip';
import {RouterModule} from '@angular/router';


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
        SharedModule,
        FormsModule,
        TooltipModule,
        RouterModule,
    ]
})
export class CoreModule {
}
