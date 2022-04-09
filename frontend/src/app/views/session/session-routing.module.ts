import {RouterModule, Routes} from '@angular/router';
import {SessionComponent} from './session/session.component';
import {NgModule} from '@angular/core';

const routes: Routes = [
    {path: '', component: SessionComponent}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SessionRoutingModule {
}
