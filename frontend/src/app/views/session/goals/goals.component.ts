import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import * as _ from 'lodash';
import {Goal} from '../shared/goal';

@Component({
    selector: 'app-goals',
    templateUrl: './goals.component.html',
    styleUrls: ['./goals.component.scss']
})
export class GoalsComponent implements OnInit {

    @Input()
    goals: FormControl | undefined;
    selectedGoals: Goal[] = [];

    constructor() {
    }

    ngOnInit(): void {
    }

    onAddGoal($event: SubmitEvent, addGoalInput: HTMLInputElement): void {
        const newGoal = {name: addGoalInput.value.trim(), finished: false};
        this.goals?.value.push(newGoal);
        this.goals?.updateValueAndValidity();
        addGoalInput.value = '';
        $event.preventDefault();
    }

    onReorderGoals(): void {
        this.goals?.patchValue(this.goals?.value);
    }

    isFirstInGoalList(goal: Goal): boolean {
        return _.indexOf(this.goals?.value, goal) === 0;
    }

    onRemoveGoal(goal: Goal): void {
        this.selectedGoals = [];
        this.goals?.patchValue(_.without(this.goals?.value, goal));
    }

    onFinishGoal(goal: Goal): void {
        goal.finished = !goal.finished;
        this.goals?.updateValueAndValidity();
    }
}
