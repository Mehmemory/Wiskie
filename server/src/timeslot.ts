import { Day } from "./day"

export class Timeslot {

    public fuzzy: boolean;
    
    constructor(
        private startTime: Day,
        private endTime: Day,
        private weekday: number,
        private freetime: boolean,
        private name: string,
        private priority: number,
        private description: string
    ) {
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
    } // end of constructor



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