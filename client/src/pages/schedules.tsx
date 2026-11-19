import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"
import type { CSSProperties } from "react"
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

type CalendarSlotPlacement = {
  timeslot: TimeslotDto
  lane: number
  laneCount: number
}

const calendarPixelsPerMinute = 0.75

function getTimeInMinutes(time: DayDto | null): number {
  return time ? time.hour * 60 + time.minute : 0
}

// Lay concurrent slots out in side-by-side lanes so none hides another.
function getCalendarPlacements(timeslots: TimeslotDto[]): CalendarSlotPlacement[] {
  const placements: CalendarSlotPlacement[] = []
  let group: TimeslotDto[] = []
  let groupEnd = -1

  function finishGroup() {
    const laneEnds: number[] = []
    const groupPlacements: Omit<CalendarSlotPlacement, "laneCount">[] = []

    for (const timeslot of group) {
      const start = getTimeInMinutes(timeslot.startTime)
      const end = getTimeInMinutes(timeslot.endTime)
      let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start)
      if (lane === -1) lane = laneEnds.length

      laneEnds[lane] = end
      groupPlacements.push({ timeslot, lane })
    }

    for (const placement of groupPlacements) {
      placements.push({ ...placement, laneCount: laneEnds.length })
    }

    group = []
    groupEnd = -1
  }

  for (const timeslot of timeslots) {
    const start = getTimeInMinutes(timeslot.startTime)
    const end = getTimeInMinutes(timeslot.endTime)

    if (group.length > 0 && start >= groupEnd) finishGroup()
    group.push(timeslot)
    groupEnd = Math.max(groupEnd, end)
  }
  finishGroup()

  return placements
}

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
  const [editingTimeslot, setEditingTimeslot] = useState<TimeslotDto | null>(null)
  const [scheduleView, setScheduleView] = useState<"list" | "calendar">("calendar")
  const calendarScrollRef = useRef<HTMLDivElement>(null)
  const timeslotsByDay = schedules[0]?.timeslots ?? Array.from({ length: 7 }, () => [])

  // Start near the usual daytime schedule while keeping the full 24-hour grid.
  useEffect(() => {
    if (calendarScrollRef.current) {
      calendarScrollRef.current.scrollTop =
        6 * 60 * calendarPixelsPerMinute
    }
  }, [])

  // Replace client state with the server snapshot to keep validation and
  // ordering decisions authoritative on the backend.
  async function saveNewTimeslot(timeslot: SaveTimeslotDto) {
    const response = await createTimeslot(DEFAULT_PROFILE_ID, timeslot)
    onSchedulesChange(response.schedules)
    setIsAdding(false)
    setEditingTimeslot(null)
  }

  async function saveTimeslot(id: string, timeslot: SaveTimeslotDto) {
    const response = await updateTimeslot(DEFAULT_PROFILE_ID, id, timeslot)
    onSchedulesChange(response.schedules)
    setEditingTimeslot(null)
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
            setEditingTimeslot(null)
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

      {editingTimeslot && (
        <section className="timeslot-editor-card">
          <h2>Edit {editingTimeslot.name}</h2>
          <TimeslotForm
            key={editingTimeslot.id}
            initialValues={editingTimeslot}
            submitLabel="Save changes"
            onSave={(values) => saveTimeslot(editingTimeslot.id, values)}
            onCancel={() => setEditingTimeslot(null)}
          />
        </section>
      )}

      <section className="schedule-view" aria-label="Schedule display">
        <div className="schedule-view__toolbar">
          <div>
            <h2>Weekly schedule</h2>
            <p>Choose how you want to view your timeslots.</p>
          </div>
          <div className="schedule-view__toggle" role="group" aria-label="Schedule view">
            <button
              type="button"
              className={scheduleView === "list" ? "is-selected" : ""}
              aria-pressed={scheduleView === "list"}
              onClick={() => setScheduleView("list")}
            >
              List
            </button>
            <button
              type="button"
              className={scheduleView === "calendar" ? "is-selected" : ""}
              aria-pressed={scheduleView === "calendar"}
              onClick={() => setScheduleView("calendar")}
            >
              Calendar
            </button>
          </div>
        </div>

        {scheduleView === "list" ? (
          <div className="schedule-editor__days">
            {dayNames.map((day, dayIndex) => {
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
                                  setEditingTimeslot(timeslot)
                                }}
                                aria-label={`Edit ${timeslot.name}`}
                              >
                                Edit
                              </button>
                            </div>
                            <h3>{timeslot.name}</h3>
                            {timeslot.description && <p>{timeslot.description}</p>}
                            <p className="timeslot-card__metadata">
                              {timeslot.freetime ? "Free time" : "Scheduled"} ·
                              Priority {timeslot.priority}
                            </p>
                          </article>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )
            })}
          </div>
        ) : (
          <div className="week-calendar-section">
            <p className="week-calendar-section__hint">
              Events are positioned by start time and sized by duration.
            </p>
            <div className="week-calendar-scroll" ref={calendarScrollRef}>
              <div className="week-calendar">
                <div className="week-calendar__corner">Time</div>
                {dayNames.map((day, dayIndex) => {
                  const count = timeslotsByDay[dayIndex]?.length ?? 0
                  return (
                    <div className="week-calendar__day-heading" key={day}>
                      <strong>{day}</strong>
                      <span>{count}</span>
                    </div>
                  )
                })}

                <div className="week-calendar__time-axis" aria-hidden="true">
                  {Array.from({ length: 24 }, (_, hour) => (
                    <div className="week-calendar__hour-label" key={hour}>
                      {String(hour).padStart(2, "0")}:00
                    </div>
                  ))}
                </div>

                {dayNames.map((day, dayIndex) => {
                  // The API's Sunday-first weekday buckets map directly to columns.
                  const placements = getCalendarPlacements(
                    timeslotsByDay[dayIndex] ?? [],
                  )

                  return (
                    <div className="week-calendar__day" key={day}>
                      {placements.map(({ timeslot, lane, laneCount }) => {
                        const start = getTimeInMinutes(timeslot.startTime)
                        const duration = Math.max(
                          1,
                          getTimeInMinutes(timeslot.endTime) - start,
                        )
                        const style: CSSProperties = {
                          top: `${start * calendarPixelsPerMinute}px`,
                          height: `${duration * calendarPixelsPerMinute}px`,
                          left: `${(lane / laneCount) * 100}%`,
                          width: `${100 / laneCount}%`,
                        }

                        return (
                          <button
                            className={`week-calendar__event${timeslot.freetime ? " week-calendar__event--free" : ""}`}
                            key={timeslot.id}
                            style={style}
                            type="button"
                            onClick={() => {
                              setIsAdding(false)
                              setEditingTimeslot(timeslot)
                            }}
                            aria-label={`Edit ${timeslot.name}, ${day}, ${formatTime(timeslot.startTime)} to ${formatTime(timeslot.endTime)}`}
                            title={`${timeslot.name}: ${formatTime(timeslot.startTime)}–${formatTime(timeslot.endTime)}`}
                          >
                            <span className="week-calendar__event-time">
                              {formatTime(timeslot.startTime)}–
                              {formatTime(timeslot.endTime)}
                            </span>
                            <strong>{timeslot.name}</strong>
                            {duration >= 45 && timeslot.description && (
                              <span className="week-calendar__event-description">
                                {timeslot.description}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

export default Schedules
