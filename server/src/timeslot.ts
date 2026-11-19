import { Day } from "./day"
import {
    DEFAULT_SCHEDULE_SETTINGS,
    type ScheduleSettings,
} from "../../shared/schedule-settings"

/**
 * Domain entity for one scheduled or free-time block. A Timeslot belongs to
 * one Schedule; its stable ID is retained when the editor replaces its values.
 */
export class Timeslot {

    // Reserved for future flexible-time scheduling. Current API inputs require
    // concrete start/end values, so current slots are not fuzzy.
    public fuzzy: boolean;
    
    constructor(
        private startTime: Day,
        private endTime: Day,
        private weekday: number,
        private freetime: boolean,
        private name: string,
        private priority: number,
        private description: string,
        private readonly id: string,
        settings: ScheduleSettings = DEFAULT_SCHEDULE_SETTINGS,
    ) {
        if (name.length > settings.maxTimeslotNameLength) {
            throw new Error(
                `Timeslot name must be ${settings.maxTimeslotNameLength} characters or fewer`,
            );
        }
        if (!settings.allowNegativePriority && priority < 0) {
            throw new Error("Priority cannot be negative");
        }

        if (endTime && startTime) {
            if (endTime.timeinminutes < startTime.timeinminutes) {
                throw new Error("End time cannot be before start time");
            }
            else{
                this.startTime = startTime;
                this.endTime = endTime;
                this.fuzzy = false;
            }
    }
        else {
            this.fuzzy = true;
        }
    }

    /** Stable identity used by profile-scoped update requests. */
    getId(): string {
        return this.id;
    }

    getStartTime(): Day {
        return this.startTime;
    }
    getEndTime(): Day {
        return this.endTime;
    }
    getWeekday(): number {
        return this.weekday;
    }
    getName(): string {
        return this.name;
    }
    getPriority(): number {
        return this.priority;
    }
    getDescription(): string {
        return this.description;
    }
    getFreetime(): boolean {
        return this.freetime;
    }

    // These guarded mutations are useful when adjusting a slot in domain logic;
    // current API updates build a validated replacement Timeslot instead.
    newStartTime(newStartTime: Day): void {
        if (this.endTime && newStartTime.timeinminutes > this.endTime.timeinminutes) {
            throw new Error("New start time cannot be after end time");
        }
        this.startTime = newStartTime;  
    }
    newEndTime(newEndTime: Day): void {
        if (this.startTime && newEndTime.timeinminutes < this.startTime.timeinminutes) {
            throw new Error("New end time cannot be before start time");
        }
        this.endTime = newEndTime;
    }
    newWeekday(newWeekday: number): void {
        if (newWeekday < 0 || newWeekday > 6) {
            throw new Error("Weekday must be between 0 and 6");
        }
        this.weekday = newWeekday;
    }

} // end of Timeslot class