import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SessionComponent} from './views/session/session/session.component';
import {HomeComponent} from './views/core/home/home.component';
import {PageNotFoundComponent} from './views/core/page-not-found/page-not-found.component';

const routes: Routes = [
    {path: 'session', loadChildren: () => import('./views/session/session.module').then(m => m.SessionModule)},
    {path: '', component: HomeComponent},
    {path: '**', component: PageNotFoundComponent},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
