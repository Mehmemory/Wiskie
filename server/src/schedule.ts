import { Timeslot } from "./timeslot";

export class Schedule {

    public timeslots: Timeslot[][];


    constructor() {
        this.timeslots = [[], [], [], [], [], [], []];
    }

    addTimeslot(timeslot: Timeslot) {
        if (timeslot.getWeekday() < 0 || timeslot.getWeekday() > 6) {
            throw new Error("Weekday must be between 0 and 6");
        }

        this.warnAboutOverlaps(timeslot);
        this.timeslots[timeslot.getWeekday()].push(timeslot);
    }

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