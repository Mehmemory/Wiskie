import cors from "cors";
import express from "express";
import { Schedule } from "./src/schedule"
import { Timeslot } from "./src/timeslot"
import { Day } from "./src/day"
import type { SchedulesResponse } from "../shared/api-types"

const app = express();
const corsOptions = {
    origin: ["http://localhost:5173"]
};

app.use(cors(corsOptions));

app.get("/api", (_req, res) => {
    res.json({
        message: "Hello from server!",
        hope: ["this", "works", "now"]
    });
});

const schedule = new Schedule()

schedule.addTimeslot(
  new Timeslot(
    new Day(9, 0),          // start time
    new Day(10, 30),        // end time
    1,                      // weekday: 1 means Monday, if you use Sunday = 0
    false,                  // freetime
    "Computer Science",     // name
    1,                      // priority
    "Lecture",              // description
  ),
)

app.get("/api/schedules", (_req, res) => {
  const response: SchedulesResponse = {
    schedules: [
      {
        timeslots: schedule.timeslots.map((day) =>
          day.map((slot) => ({
            name: slot.getName(),
            weekday: slot.getWeekday(),
            startTime: {
              hour: slot.getStartTime().hour,
              minute: slot.getStartTime().minute,
            },
            endTime: {
              hour: slot.getEndTime().hour,
              minute: slot.getEndTime().minute,
            },
            description: slot.getDescription(),
            priority: slot.getPriority(),
          })),
        ),
      },
    ],
  }

  res.json(response)
})

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});