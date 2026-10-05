
export class Day {

    hour: number;
    minute: number;
    //use to compare time
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
        
        //useful for comparing time
        this.timeinminutes = hour * 60 + minute;
    }


}