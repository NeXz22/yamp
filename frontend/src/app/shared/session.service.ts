import {Injectable} from '@angular/core';
import {SessionSettings} from '../views/session/shared/session-settings';

@Injectable({
    providedIn: 'root'
})
export class SessionService {

    storedSessionSettings: SessionSettings | null = null;

    constructor() {
    }

    addSessionSettings(loadedSessionSettings: SessionSettings) {
        this.storedSessionSettings = loadedSessionSettings;
    }
}
