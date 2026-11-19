import { Timeslot } from "./timeslot";

/**
 * One profile's weekly schedule. Each of the seven array buckets corresponds
 * to a Sunday-first weekday index and contains that day's Timeslot entities.
 */
export class Schedule {

    public timeslots: Timeslot[][];


    constructor() {
        this.timeslots = [[], [], [], [], [], [], []];
    }

    /** Add a slot to its weekday bucket and report (but do not reject) overlaps. */
    addTimeslot(timeslot: Timeslot) {
        if (timeslot.getWeekday() < 0 || timeslot.getWeekday() > 6) {
            throw new Error("Weekday must be between 0 and 6");
        }

        this.warnAboutOverlaps(timeslot);
        this.timeslots[timeslot.getWeekday()].push(timeslot);
    }

    /**
     * Replace a slot by stable ID, moving it to a new weekday if needed.
     * Returns false when the ID is not in this schedule.
     */
    updateTimeslot(id: string, replacement: Timeslot): boolean {
        if (replacement.getWeekday() < 0 || replacement.getWeekday() > 6) {
            throw new Error("Weekday must be between 0 and 6");
        }

        const existingDay = this.timeslots.findIndex((day) =>
            day.some((timeslot) => timeslot.getId() === id),
        );
        if (existingDay === -1) return false;

        const existingIndex = this.timeslots[existingDay].findIndex(
            (timeslot) => timeslot.getId() === id,
        );
        const [existing] = this.timeslots[existingDay].splice(existingIndex, 1);
        if (!existing) return false;
        this.warnAboutOverlaps(replacement);
        this.timeslots[replacement.getWeekday()].push(replacement);
        return true;
    }

    // Half-open interval comparison allows adjacent slots (e.g. 10:00–11:00
    // and 11:00–12:00) without treating their shared boundary as an overlap.
    private warnAboutOverlaps(timeslot: Timeslot) {
        const dayTimeslots = this.timeslots[timeslot.getWeekday()];

        for (const existing of dayTimeslots) {
            const overlaps =
                timeslot.getStartTime().timeinminutes < existing.getEndTime().timeinminutes &&
                existing.getStartTime().timeinminutes < timeslot.getEndTime().timeinminutes;

            if (overlaps) {
                console.warn(`Timeslot overlaps with existing timeslot: ${existing.getName()}`);
            }
        }
    }
}