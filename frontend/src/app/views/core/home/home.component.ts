import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {SessionSettings} from '../../session/shared/session-settings';
import {SessionService} from '../../../shared/session.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    sessionName: string = '';

    constructor(
        private router: Router,
        private sessionService: SessionService,
    ) {
    }

    ngOnInit(): void {
    }

    onCreateSessionFormSubmit(loadedSessionSettings?: SessionSettings): void {
        let sessionId;

        if (loadedSessionSettings) {
            sessionId = loadedSessionSettings.sessionId;
        } else {
            sessionId = this.sessionName.trim().toLowerCase() + Date.now();
        }

        this.router.navigate(['/s'], {queryParams: {id: sessionId}})
            .then()
            .catch(reason => console.log(`Navigation towards \'/session/\' failed. Reason: ${reason}`));
    }

    onUploadSession(fileInput: HTMLInputElement) {
        fileInput.click();
    }

    onFileSelected(files: FileList | null) {
        if (files) {
            let fileReader = new FileReader();
            fileReader.onload = () => {
                if (typeof fileReader.result === "string") {
                    const loadedSessionSettings = JSON.parse(fileReader.result);
                    if (loadedSessionSettings.sessionId) {
                        this.sessionService.addSessionSettings(loadedSessionSettings);
                        this.onCreateSessionFormSubmit(loadedSessionSettings);
                    }
                }
            }
            fileReader.readAsText(files[0]);
        }
    }
}
