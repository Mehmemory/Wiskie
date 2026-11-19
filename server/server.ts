import cors from "cors";
import express from "express";
import { Schedule } from "./src/schedule"
import { Timeslot } from "./src/timeslot"
import { Day } from "./src/day"
import type {
  CreateTimeslotDto,
  DayDto,
  SchedulesResponse,
} from "../shared/api-types"

const app = express();
const corsOptions = {
    origin: ["http://localhost:5173"]
};

app.use(cors(corsOptions));
app.use(express.json());

// Returns the server's basic status message and sample data.
app.get("/api", (_req, res) => {
    res.json({
        message: "Hello from server!",
        hope: ["this", "works", "now"]
    });
});

// Increments the number sent by the client and returns the result.
app.post("/api/incriment", (req, res) => { 
    const number = Number(req.body.number);
    console.log("Received number from client:", number);
    const incrementedNumber = number + 1;
    console.log("Incremented number:", incrementedNumber);
    res.json({ number: incrementedNumber });

});

const schedule = new Schedule()

// Checks whether an unknown value is a non-null JSON object.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

// Checks whether an unknown value contains a valid 24-hour time.
function isDayDto(value: unknown): value is DayDto {
  if (!isRecord(value)) return false

  return (
    Number.isInteger(value.hour) &&
    typeof value.hour === "number" &&
    value.hour >= 0 &&
    value.hour <= 23 &&
    Number.isInteger(value.minute) &&
    typeof value.minute === "number" &&
    value.minute >= 0 &&
    value.minute <= 59
  )
}

// Validates the fields required to create a schedule timeslot.
function isCreateTimeslotRequest(value: unknown): value is CreateTimeslotDto {
  if (!isRecord(value)) return false

  return (
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    typeof value.description === "string" &&
    value.description.trim().length > 0 &&
    Number.isInteger(value.weekday) &&
    typeof value.weekday === "number" &&
    value.weekday >= 0 &&
    value.weekday <= 6 &&
    isDayDto(value.startTime) &&
    isDayDto(value.endTime) &&
    typeof value.freetime === "boolean" &&
    Number.isInteger(value.priority) &&
    typeof value.priority === "number"
  )
}

// Converts the in-memory schedule into the API response shape.
function getSchedulesResponse(): SchedulesResponse {
  return {
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
            freetime: slot.getFreetime(),
          })),
        ),
      },
    ],
  }
}

// Validates submitted timeslot data, adds it to the scheduler, and returns the updated schedule.
app.post("/api/schedules", (req, res) => {
  // Treat incoming JSON as untrusted until the request validator checks it.
  const body: unknown = req.body

  // Reject missing or incorrectly typed fields before creating scheduler objects.
  if (!isCreateTimeslotRequest(body)) {
    return res.status(400).json({ error: "Invalid timeslot values" })
  }

  // Reject zero-length or backwards timeslots before adding them to the schedule.
  if (
    body.endTime.hour * 60 + body.endTime.minute <=
    body.startTime.hour * 60 + body.startTime.minute
  ) {
    return res.status(400).json({ error: "End time must be after start time" })
  }

  // Convert the validated request into domain objects and store the timeslot.
  schedule.addTimeslot(
    new Timeslot(
      new Day(body.startTime.hour, body.startTime.minute),
      new Day(body.endTime.hour, body.endTime.minute),
      body.weekday,
      body.freetime,
      body.name.trim(),
      body.priority,
      body.description,
    ),
  )

  // Return the full updated schedule so the client can refresh its display.
  return res.status(201).json(getSchedulesResponse())
})

// Add a sample timeslot
schedule.addTimeslot(
  new Timeslot(
    new Day(9, 0),          // start time
    new Day(10, 30),        // end time
    1,                      // weekday: 1 means Monday, if you use Sunday = 0
    false,                  // freetime
    "Computer Science",     // name
    1,                      // priority
    "Test",              // description
  ),
)

// Returns all current timeslots in the scheduler.
app.get("/api/schedules", (_req, res) => {
  res.json(getSchedulesResponse())
})

// Starts the HTTP server and reports when it is ready.
app.listen(8080, () => {
    console.log("Server is running on port 8080");
});