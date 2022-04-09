import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    sessionName: string = '';

    constructor(private router: Router) {
    }

    ngOnInit(): void {
    }

    onCreateSessionFormSubmit(): void {
        const sessionId = this.sessionName.trim().toLowerCase() + Date.now();

        this.router.navigate(['/session'], {queryParams: {id: sessionId}})
            .then()
            .catch(reason => console.log('Navigation towards \'/session/\' failed. Reason: ' + reason));
    }
}
