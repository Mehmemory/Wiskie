import { useState } from "react"
import type { FormEvent } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { createTimeslot } from "../api"

import type {
  CreateTimeslotDto,
  DayDto,
  ScheduleDto,
} from "../../../shared/api-types"

type SchedulesProps = {
  schedules: ScheduleDto[]
  onSchedulesChange: (schedules: ScheduleDto[]) => void
}

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

// Formats a time as HH:MM, or labels it unspecified when no time is present.
function formatTime(time: DayDto | null) {
  if (!time) return "Unspecified"

  const hour = String(time.hour).padStart(2, "0")
  const minute = String(time.minute).padStart(2, "0")

  return `${hour}:${minute}`
}

// Parses a form time value and returns it only when its hour and minute are valid.
function parseTime(value: FormDataEntryValue | null): DayDto | null {
  if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) return null

  const [hour, minute] = value.split(":").map(Number)
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null

  return { hour, minute }
}

type AddEntryFormProps = {
  onSchedulesChange: (schedules: ScheduleDto[]) => void
}

// Renders the timeslot form and tracks its submission and error state.
function AddEntryForm({ onSchedulesChange }: AddEntryFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validates form values, posts a new timeslot, and updates the displayed schedule.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const form = event.currentTarget
    const data = new FormData(form)
    const name = data.get("name")
    const description = data.get("message")
    const dayValue = data.get("day")
    const priorityValue = data.get("priority")
    const startTime = parseTime(data.get("startTime"))
    const endTime = parseTime(data.get("endTime"))

    if (typeof name !== "string" || !name.trim()) {
      setError("Name is required.")
      return
    }
    if (typeof description !== "string" || !description.trim()) {
      setError("Description is required.")
      return
    }
    if (typeof dayValue !== "string" || dayValue === "") {
      setError("Choose a day.")
      return
    }

    const weekday = Number(dayValue)
    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
      setError("Choose a valid day.")
      return
    }
    if (!startTime || !endTime) {
      setError("Enter a valid start and end time.")
      return
    }
    if (
      endTime.hour * 60 + endTime.minute <=
      startTime.hour * 60 + startTime.minute
    ) {
      setError("End time must be after start time.")
      return
    }
    if (typeof priorityValue !== "string" || priorityValue.trim() === "") {
      setError("Priority is required.")
      return
    }

    const priority = Number(priorityValue)
    if (!Number.isInteger(priority)) {
      setError("Priority must be a whole number.")
      return
    }

    // Build the typed API payload, including the checkbox's boolean value.
    const entry: CreateTimeslotDto = {
      name: name.trim(),
      description,
      weekday,
      startTime,
      endTime,
      priority,
      freetime: data.has("freetime"),
    }

    setIsSubmitting(true)
    try {
      // Save the entry and replace local schedule state with the server response.
      const response = await createTimeslot(entry)
      onSchedulesChange(response.schedules)
      form.reset()
    } catch (submitError) {
      // Show a useful message for both server responses and unexpected errors.
      if (axios.isAxiosError<{ error?: string }>(submitError)) {
        setError(
          submitError.response?.data?.error ??
            submitError.message ??
            "Could not save schedule entry.",
        )
      } else {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Could not save schedule entry.",
        )
      }
    } finally {
      // Re-enable submission whether the request succeeded or failed.
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name: <input type="text" name="name" required />
      </label>
      <label>
        Description: <textarea name="message" required />
      </label>
      <label>
        Start Time: <input type="time" name="startTime" required />
      </label>
      <label>
        End Time: <input type="time" name="endTime" required />
      </label>
      <label>
        Day:
        <select name="day" required defaultValue="">
          <option value="" disabled>
            Choose a day
          </option>
          {dayNames.map((day, index) => (
            <option key={day} value={index}>
              {day}
            </option>
          ))}
        </select>
      </label>
      <label>
        Freetime: <input type="checkbox" name="freetime" />
      </label>
      <label>
        Priority: <input type="number" name="priority" step="1" required />
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Submit"}
      </button>
    </form>
  )
}

// Displays scheduled timeslots and provides the form for adding a new one.
function Schedules({ schedules, onSchedulesChange }: SchedulesProps) {
  return (
    <main>
      <h1>Schedules</h1>
      <p>This is the schedules page.</p>

      {schedules.map((schedule, scheduleIndex) => (
        <section key={scheduleIndex}>
          <h2>Schedule</h2>

          {schedule.timeslots.map((daySlots, dayIndex) => (
            <section key={dayIndex}>
              <h3>{dayNames[dayIndex]}</h3>

              {daySlots.length === 0 ? (
                <p>Nothing scheduled</p>
              ) : (
                <ul>
                  {daySlots.map((slot, slotIndex) => (
                    <li key={slotIndex}>
                      {formatTime(slot.startTime)}–{formatTime(slot.endTime)}
                      {" — "}
                      {slot.name}: {slot.description} (
                      {slot.freetime ? "Freetime" : "Scheduled"}; priority{" "}
                      {slot.priority})
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </section>
      ))}

      <section>
        <h2>Add Entry</h2>
        <AddEntryForm onSchedulesChange={onSchedulesChange} />
      </section>

      <Link to="/">Go to Home</Link>
      <Link to="/base">Go to Base</Link>
      <Link to="/schedules">Go to Schedules</Link>
      <Link to="/editor">Go to Editor</Link>
    </main>
  )
}

export default Schedules
