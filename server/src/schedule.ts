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


        // Check for overlapping timeslots on the same day
        // if so prompt user with options
            //option 1: replace existing timeslot with new one
            //option 2: keep existing timeslot and discard new one
            //option 3: keep both timeslots with overlapping times
            //option 4: allow user to edit new or old timeslot to resolve overlap
        const dayTimeslots = this.timeslots[timeslot.getWeekday()];

        for (const existing of dayTimeslots) {
            const overlaps =
                timeslot.getStartTime().timeinminutes < existing.getEndTime().timeinminutes &&
                existing.getStartTime().timeinminutes < timeslot.getEndTime().timeinminutes;

            if (overlaps) {
                // Handle overlap according to your application's requirements
                console.warn(`Timeslot overlaps with existing timeslot: ${existing.getName()}`);
            }
        }

        dayTimeslots.push(timeslot);
    }



}