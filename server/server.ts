import cors from "cors";
import express from "express";
import { randomUUID } from "node:crypto"
import { Schedule } from "./src/schedule"
import { ProfileScheduleStore } from "./src/profile-schedule-store"
import { Timeslot } from "./src/timeslot"
import { Day } from "./src/day"
import type {
  CreateTimeslotDto,
  DayDto,
  ProfileId,
  SchedulesResponse,
} from "../shared/api-types"
import { DEFAULT_PROFILE_ID } from "../shared/api-types"

const app = express();
// The development client and API use separate origins.
const corsOptions = {
    origin: ["http://localhost:5173"]
};

app.use(cors(corsOptions));
app.use(express.json());

const scheduleStore = new ProfileScheduleStore()

// JSON request bodies are untrusted at runtime even when their TypeScript
// payload type is shared with the client.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

// Runtime guard for the nested time shape used by the shared DTO.
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

// TypeScript types disappear at runtime, so validate every required field here.
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

// Adapt domain entities to plain JSON DTOs; clients never receive class instances.
function getSchedulesResponse(profileId: ProfileId): SchedulesResponse {
  const schedule = scheduleStore.get(profileId)
  return {
    schedules: [
      {
        timeslots: schedule.timeslots.map((day) =>
          day.map((slot) => ({
            id: slot.getId(),
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

function isProfileId(value: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(value)
}

// Build domain objects only after request validation has succeeded.
// Updates keep the existing ID; creates get a fresh server-generated ID.
function createTimeslot(
  dto: CreateTimeslotDto,
  id: string = randomUUID(),
): Timeslot {
  return new Timeslot(
    new Day(dto.startTime.hour, dto.startTime.minute),
    new Day(dto.endTime.hour, dto.endTime.minute),
    dto.weekday,
    dto.freetime,
    dto.name.trim(),
    dto.priority,
    dto.description.trim(),
    id,
  )
}

// Validates and creates a schedule entry within its profile scope.
app.post("/api/profiles/:profileId/timeslots", (req, res) => {
  const { profileId } = req.params
  if (!isProfileId(profileId)) {
    return res.status(400).json({ error: "Invalid profile ID" })
  }

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

  scheduleStore.get(profileId).addTimeslot(createTimeslot(body))

  // Return the full updated schedule so the client can refresh its display.
  return res.status(201).json(getSchedulesResponse(profileId))
})

// Updates a timeslot only within the requested profile's schedule. A slot ID
// from another profile cannot resolve through this profile's Schedule.
app.put("/api/profiles/:profileId/timeslots/:timeslotId", (req, res) => {
  const { profileId, timeslotId } = req.params
  if (!isProfileId(profileId)) {
    return res.status(400).json({ error: "Invalid profile ID" })
  }

  const body: unknown = req.body
  if (!isCreateTimeslotRequest(body)) {
    return res.status(400).json({ error: "Invalid timeslot values" })
  }
  if (
    body.endTime.hour * 60 + body.endTime.minute <=
    body.startTime.hour * 60 + body.startTime.minute
  ) {
    return res.status(400).json({ error: "End time must be after start time" })
  }

  const schedule = scheduleStore.find(profileId)
  if (
    !schedule ||
    !schedule.updateTimeslot(timeslotId, createTimeslot(body, timeslotId))
  ) {
    return res.status(404).json({ error: "Timeslot not found" })
  }

  return res.json(getSchedulesResponse(profileId))
})

// Reading creates an empty profile schedule on first access, ready for entries.
app.get("/api/profiles/:profileId/schedules", (req, res) => {
  const { profileId } = req.params
  if (!isProfileId(profileId)) {
    return res.status(400).json({ error: "Invalid profile ID" })
  }

  return res.json(getSchedulesResponse(profileId))
})

// Seed development data only for the default profile; other profiles start empty.
scheduleStore.get(DEFAULT_PROFILE_ID).addTimeslot(
  new Timeslot(
    new Day(9, 0),          // start time
    new Day(10, 30),        // end time
    1,                      // weekday: 1 means Monday, if you use Sunday = 0
    false,                  // freetime
    "Computer Science",     // name
    1,                      // priority
    "Test",              // description
    randomUUID(),
  ),
)

// Starts the HTTP server and reports when it is ready.
app.listen(8080, () => {
    console.log("Server is running on port 8080");
});