
/**
 * A validated 24-hour wall-clock time. `timeinminutes` lets schedule logic
 * compare times without repeating hour/minute conversion.
 */
export class Day {

    hour: number;
    minute: number;
    // Cached scalar used for ordering and overlap checks.
    timeinminutes: number;

    constructor(hour: number, minute: number) {
        if (hour < 0 || hour > 23) {
            throw new Error("Hour must be between 0 and 23");
        }
        if (minute < 0 || minute > 59) {
            throw new Error("Minute must be between 0 and 59");
        }
        this.hour = hour;
        this.minute = minute;
        
        this.timeinminutes = hour * 60 + minute;
    }


}