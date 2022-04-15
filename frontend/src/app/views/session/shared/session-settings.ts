import {Goal} from './goal';

export interface SessionSettings {
    sessionId?: string;
    inputMinutes: number;
    inputSeconds: number;
    participants: string[];
    countdownRunning: boolean;
    countdownStartedAt: number | null;
    countdownStoppedAt: number | null;
    useNavigatorRole: boolean;
    useGoals: boolean;
    goals: Goal[];
}
