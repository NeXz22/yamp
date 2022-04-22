import {Component, OnInit} from '@angular/core';
import {PrimeNGConfig} from 'primeng/api';
import {Title} from '@angular/platform-browser';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    title = 'YAMP - yet another mobbing program';

    constructor(
        private primengConfig: PrimeNGConfig,
        private titleService: Title
    ) {
    }

    ngOnInit() {
        this.titleService.setTitle(this.title);
        this.primengConfig.ripple = true;
    }
}
