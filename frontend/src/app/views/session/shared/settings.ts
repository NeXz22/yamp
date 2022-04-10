import {SessionSettings} from './session-settings';
import {UserSettings} from './user-settings';

export interface Settings {
    sessionSettings: SessionSettings;
    userSettings: UserSettings;
}
