import {Component, OnInit} from '@angular/core';
import {Observable, Subscription, timer} from 'rxjs';

@Component({
    selector: 'app-countdown',
    templateUrl: './countdown.component.html',
    styleUrls: ['./countdown.component.scss']
})
export class CountdownComponent implements OnInit {

    // entered time by user in milliseconds
    originalCountdownTime = 10000;
    countdownToDisplay = '';
    countdownRunning = false;
    private timerObservable: Observable<number> | undefined;
    private timerSubscription: Subscription | undefined;
    private countdownStartedAt: number = 0;
    private timePassedSinceTimerStart: number = 0;

    constructor() {
    }

    ngOnInit(): void {
        this.countdownToDisplay = this.formatMilliSecondsToCountdownString(0);
    }

    onStartCountdown(): void {
        this.countdownRunning = true;
        this.countdownStartedAt = Date.now() - this.timePassedSinceTimerStart;
        this.countdownToDisplay = this.formatMilliSecondsToCountdownString(this.originalCountdownTime - this.timePassedSinceTimerStart);
        this.timerObservable = timer(100, 100);
        this.timerSubscription = this.timerObservable.subscribe(() => {
            this.timePassedSinceTimerStart = Date.now() - this.countdownStartedAt;
            this.countdownToDisplay = this.formatMilliSecondsToCountdownString(this.originalCountdownTime - this.timePassedSinceTimerStart);
            if (this.timePassedSinceTimerStart >= this.originalCountdownTime) {
                this.timePassedSinceTimerStart = 0;
                this.onStopCountdown();
            }
        });
    }

    onStopCountdown(): void {
        this.countdownRunning = false;
        this.timerSubscription!.unsubscribe();
    }

    onResetCountdown() {
        this.onStopCountdown();
        this.timePassedSinceTimerStart = 0;
        this.countdownToDisplay = this.formatMilliSecondsToCountdownString(this.originalCountdownTime);
    }

    formatMilliSecondsToCountdownString(milliSecondsToConvert: number): string {
        if (milliSecondsToConvert <= 0) {
            return '00:00';
        }
        const seconds = Math.ceil((milliSecondsToConvert /  1000)) % 60;
        const minutes = Math.floor((milliSecondsToConvert / 60000)) % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}
