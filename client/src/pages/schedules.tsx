import { useState } from "react"
import type { FormEvent } from "react"
import axios from "axios"

import type {
  CreateTimeslotDto,
  DayDto,
  SaveTimeslotDto,
  ScheduleConflictResponse,
  ScheduleDto,
  TimeslotOverlapDto,
  TimeslotDto,
} from "../../../shared/api-types"
import { DEFAULT_PROFILE_ID } from "../../../shared/api-types"
import { DEFAULT_SCHEDULE_SETTINGS } from "../../../shared/schedule-settings"
import { createTimeslot, updateTimeslot } from "../api"

type SchedulesProps = {
  // The profile-scoped snapshot managed by App and returned by the API.
  schedules: ScheduleDto[]
  onSchedulesChange: (schedules: ScheduleDto[]) => void
}

type TimeslotFormProps = {
  initialValues?: TimeslotDto
  submitLabel: string
  onSave: (timeslot: SaveTimeslotDto) => Promise<void>
  onCancel?: () => void
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

// DTO times use numeric hour/minute fields; the editor displays standard 24-hour time.
function formatTime(time: DayDto | null): string {
  if (!time) return "Unspecified"

  const hour = String(time.hour).padStart(2, "0")
  const minute = String(time.minute).padStart(2, "0")
  return `${hour}:${minute}`
}

// Convert a DTO time to the value expected by an HTML time input.
function timeInputValue(time: DayDto | null | undefined): string {
  if (!time) return ""
  return `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`
}

// Parse browser form data defensively before building the typed API payload.
function parseTime(value: FormDataEntryValue | null): DayDto | null {
  if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) return null

  const [hour, minute] = value.split(":").map(Number)
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null
  return { hour, minute }
}

// Preserve server validation messages when available, with a useful network fallback.
function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return (
      error.response?.data?.error ??
      error.message ??
      "Could not save this timeslot."
    )
  }

  return error instanceof Error ? error.message : "Could not save this timeslot."
}

// Shared by create and edit modes so both send the same create/update payload.
function TimeslotForm({
  initialValues,
  submitLabel,
  onSave,
  onCancel,
}: TimeslotFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [overlaps, setOverlaps] = useState<TimeslotOverlapDto[] | null>(null)
  const [pendingTimeslot, setPendingTimeslot] =
    useState<CreateTimeslotDto | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function saveTimeslot(timeslot: CreateTimeslotDto, confirm = false) {
    setError(null)
    setIsSubmitting(true)
    try {
      await onSave(
        confirm
          ? {
              ...timeslot,
              confirmedOverlapIds: overlaps?.map((overlap) => overlap.id) ?? [],
            }
          : timeslot,
      )
      setOverlaps(null)
      setPendingTimeslot(null)
    } catch (saveError) {
      if (
        axios.isAxiosError<ScheduleConflictResponse>(saveError) &&
        saveError.response?.status === 409 &&
        Array.isArray(saveError.response.data?.overlaps)
      ) {
        setPendingTimeslot(timeslot)
        setOverlaps(saveError.response.data.overlaps)
      } else {
        setError(getErrorMessage(saveError))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setOverlaps(null)
    setPendingTimeslot(null)

    const data = new FormData(event.currentTarget)
    const name = data.get("name")
    const description = data.get("description")
    const weekdayValue = data.get("weekday")
    const priorityValue = data.get("priority")
    const startTime = parseTime(data.get("startTime"))
    const endTime = parseTime(data.get("endTime"))

    if (
      typeof name !== "string" ||
      typeof description !== "string" ||
      typeof weekdayValue !== "string" ||
      typeof priorityValue !== "string" ||
      !startTime ||
      !endTime
    ) {
      setError("Complete all fields with valid values.")
      return
    }

    // IDs are intentionally absent: the server owns resource identity.
    const timeslot: CreateTimeslotDto = {
      name,
      description: description.trim(),
      weekday: Number(weekdayValue),
      startTime,
      endTime,
      priority: Number(priorityValue),
      freetime: data.has("freetime"),
    }

    await saveTimeslot(timeslot)
  }

  return (
    <form
      className="timeslot-form"
      onSubmit={handleSubmit}
      onChange={() => {
        setOverlaps(null)
        setPendingTimeslot(null)
      }}
    >
      <label>
        Name
        <input
          type="text"
          name="name"
          required
          maxLength={DEFAULT_SCHEDULE_SETTINGS.maxTimeslotNameLength}
          defaultValue={initialValues?.name ?? ""}
        />
      </label>
      <label>
        Description (optional)
        <textarea
          name="description"
          rows={2}
          defaultValue={initialValues?.description ?? ""}
        />
      </label>
      <div className="timeslot-form__row">
        <label>
          Day
          <select
            name="weekday"
            required
            defaultValue={initialValues?.weekday ?? ""}
          >
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
          Priority
          <input
            type="number"
            name="priority"
            step="1"
            min={
              DEFAULT_SCHEDULE_SETTINGS.allowNegativePriority
                ? undefined
                : 0
            }
            required
            defaultValue={initialValues?.priority ?? 1}
          />
        </label>
      </div>
      <div className="timeslot-form__row">
        <label>
          Start
          <input
            type="time"
            name="startTime"
            required
            defaultValue={timeInputValue(initialValues?.startTime)}
          />
        </label>
        <label>
          End
          <input
            type="time"
            name="endTime"
            required
            defaultValue={timeInputValue(initialValues?.endTime)}
          />
        </label>
      </div>
      <label className="timeslot-form__checkbox">
        <input
          type="checkbox"
          name="freetime"
          defaultChecked={initialValues?.freetime ?? false}
        />
        Free time
      </label>
      {overlaps && (
        <div className="timeslot-form__warning" role="alert">
          <p>
            This time overlaps with {overlaps.length === 1 ? "an existing entry" : "existing entries"}:
          </p>
          <ul>
            {overlaps.map((overlap) => (
              <li key={overlap.id}>
                {overlap.name} ({formatTime(overlap.startTime)}–
                {formatTime(overlap.endTime)})
              </li>
            ))}
          </ul>
          <p>          You can adjust the time or explicitly approve these conflicts.</p>
        </div>
      )}
      {error && <p className="timeslot-form__error" role="alert">{error}</p>}
      <div className="timeslot-form__actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
        {overlaps && pendingTimeslot && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => saveTimeslot(pendingTimeslot, true)}
          >
            Save anyway
          </button>
        )}
        {onCancel && (
          <button type="button" className="button-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

function Schedules({ schedules, onSchedulesChange }: SchedulesProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingTimeslotId, setEditingTimeslotId] = useState<string | null>(
    null,
  )
  const timeslotsByDay = schedules[0]?.timeslots ?? Array.from({ length: 7 }, () => [])

  // Replace client state with the server snapshot to keep validation and
  // ordering decisions authoritative on the backend.
  async function saveNewTimeslot(timeslot: SaveTimeslotDto) {
    const response = await createTimeslot(DEFAULT_PROFILE_ID, timeslot)
    onSchedulesChange(response.schedules)
    setIsAdding(false)
  }

  async function saveTimeslot(id: string, timeslot: SaveTimeslotDto) {
    const response = await updateTimeslot(DEFAULT_PROFILE_ID, id, timeslot)
    onSchedulesChange(response.schedules)
    setEditingTimeslotId(null)
  }

  return (
    <main className="schedule-editor">
      <header className="schedule-editor__header">
        <div>
          <p className="schedule-editor__eyebrow">YOUR WEEK</p>
          <h1>Schedule editor</h1>
          <p>Keep your week up to date. Changes are saved to your schedule.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingTimeslotId(null)
            setIsAdding((isOpen) => !isOpen)
          }}
          aria-expanded={isAdding}
        >
          {isAdding ? "Close form" : "Add timeslot"}
        </button>
      </header>

      {isAdding && (
        <section className="timeslot-editor-card">
          <h2>New timeslot</h2>
          <TimeslotForm
            submitLabel="Add to schedule"
            onSave={saveNewTimeslot}
            onCancel={() => setIsAdding(false)}
          />
        </section>
      )}

      <div className="schedule-editor__days">
        {dayNames.map((day, dayIndex) => {
          // The API groups slots into seven Sunday-first buckets (0 through 6).
          const dayTimeslots = timeslotsByDay[dayIndex] ?? []

          return (
            <section className="schedule-day" key={day}>
              <header className="schedule-day__header">
                <h2>{day}</h2>
                <span>
                  {dayTimeslots.length}{" "}
                  {dayTimeslots.length === 1 ? "item" : "items"}
                </span>
              </header>

              {dayTimeslots.length === 0 ? (
                <p className="schedule-day__empty">Nothing scheduled</p>
              ) : (
                <ul className="schedule-day__list">
                  {dayTimeslots.map((timeslot) => (
                    <li className="timeslot-card" key={timeslot.id}>
                      {editingTimeslotId === timeslot.id ? (
                        <>
                          <h3>Edit timeslot</h3>
                          <TimeslotForm
                            key={timeslot.id}
                            initialValues={timeslot}
                            submitLabel="Save changes"
                            onSave={(values) =>
                              saveTimeslot(timeslot.id, values)
                            }
                            onCancel={() => setEditingTimeslotId(null)}
                          />
                        </>
                      ) : (
                        <article>
                          <div className="timeslot-card__summary">
                            <p className="timeslot-card__time">
                              {formatTime(timeslot.startTime)} –{" "}
                              {formatTime(timeslot.endTime)}
                            </p>
                            <button
                              type="button"
                              className="button-secondary"
                              onClick={() => {
                                setIsAdding(false)
                                setEditingTimeslotId(timeslot.id)
                              }}
                              aria-label={`Edit ${timeslot.name}`}
                            >
                              Edit
                            </button>
                          </div>
                          <h3>{timeslot.name}</h3>
                          <p>{timeslot.description}</p>
                          <p className="timeslot-card__metadata">
                            {timeslot.freetime ? "Free time" : "Scheduled"} ·
                            Priority {timeslot.priority}
                          </p>
                        </article>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>

    </main>
  )
}

export default Schedules
