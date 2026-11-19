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

    /** Add a slot and keep its weekday bucket in deterministic display order. */
    addTimeslot(timeslot: Timeslot) {
        if (timeslot.getWeekday() < 0 || timeslot.getWeekday() > 6) {
            throw new Error("Weekday must be between 0 and 6");
        }

        const day = this.timeslots[timeslot.getWeekday()];
        day.push(timeslot);
        this.sortDay(day);
    }

    /**
     * Find overlaps for a candidate. An optional ID is excluded when checking
     * an edit so a slot never conflicts with itself.
     */
    findOverlaps(candidate: Timeslot, excludeId?: string): Timeslot[] {
        return this.timeslots[candidate.getWeekday()].filter((existing) => {
            if (existing.getId() === excludeId) return false

            return (
                candidate.getStartTime().timeinminutes <
                  existing.getEndTime().timeinminutes &&
                existing.getStartTime().timeinminutes <
                  candidate.getEndTime().timeinminutes
            )
        })
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
        const day = this.timeslots[replacement.getWeekday()];
        day.push(replacement);
        this.sortDay(day);
        return true;
    }

    /**
     * Ordering is derived from slot data, not insertion position. A database
     * implementation can use ORDER BY start time, end time, then stable ID.
     */
    private sortDay(day: Timeslot[]) {
        day.sort((left, right) =>
            left.getStartTime().timeinminutes -
              right.getStartTime().timeinminutes ||
            left.getEndTime().timeinminutes -
              right.getEndTime().timeinminutes ||
            (left.getId() < right.getId()
              ? -1
              : left.getId() > right.getId()
                ? 1
                : 0),
        )
    }
}