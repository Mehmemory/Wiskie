import { data, Link } from "react-router-dom";
import type { FormEvent } from "react"

import type { DayDto, ScheduleDto, TimeslotDto } from "../../../shared/api-types"


type SchedulesProps = {
  schedules: ScheduleDto[],
  hope: string[]
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

function formatTime(time: DayDto | null) {
  if (!time) return "Unspecified"

  const hour = String(time.hour).padStart(2, "0")
  const minute = String(time.minute).padStart(2, "0")

  return `${hour}:${minute}`
}



function addEntry(schedules: ScheduleDto[], scheduleIndex: number, dayIndex: number, slot: any) {
    
    function parseTime(value: FormDataEntryValue | null): DayDto | null {
      if (typeof value !== "string" || value === "") return null

      const [hour, minute] = value.split(":").map(Number)
      if (!Number.isInteger(hour) && !Number.isInteger(minute)) {
        throw new Error("Enter a valid time")
      }
      if (!Number.isInteger(hour)) {
        return { hour: 0, minute }
      }
      if (!Number.isInteger(minute)) {
        return { hour, minute: 0 }
      }
      return { hour, minute }
    }


    {/* temp form submission */}
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const name = data.get("name") as string; {/* should be a string */}
      const description = data.get("message") as string; {/* should be a string */}
      const priority = Number(data.get("priority"))


      const dayValue = data.get("day")

      if (typeof dayValue !== "string" || dayValue === "") {
        throw new Error("Choose a day")
      }

      const weekday = Number(dayValue)

      if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
        throw new Error("Choose a valid day")
      }

        if (typeof name !== "string" || !name.trim()) {
          throw new Error("Name is required")
        }
        if (typeof description !== "string") {
          throw new Error("Description is required")
        }
        if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
          throw new Error("Choose a valid day")
        }
        if (!Number.isInteger(priority)) {
          throw new Error("Priority must be a whole number")
        }

      
      const freetime = data.get("freetime") as string; {/* should be a boolean */}
        const entry: TimeslotDto = {
          name: name.trim(),
          description,
          weekday,
          startTime: parseTime(data.get("startTime")),
          endTime: parseTime(data.get("endTime")),
          priority,
        }

      alert(`Form submitted with values:\nName: ${name}\nDescription: ${description}\nStart Time: ${entry.startTime}\nEnd Time: ${entry.endTime}\nDay: ${entry.weekday}\nFreetime: ${freetime}\nPriority: ${entry.priority}`);
    }

    return (
     <form onSubmit={handleSubmit}>
      <label>
        Name: <input type="text" name="name" />
      </label>
      <label>
        Description: <textarea name="message" />
      </label>
      <label>
        Start Time: <input type="time" name="startTime" />
      </label>
      <label>
        End Time: <input type="time" name="endTime" />
      </label>
      <label>
        Day:   <select name="day" required defaultValue="">
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
        Priority: <input type="number" name="priority" />
      </label>
      <button type="submit">Submit</button>
    </form>
    )


  }

function Schedules({ schedules }: SchedulesProps) {
  return (
    <main>
      <h1>Schedules</h1>
      <p>This is the schedules page.</p>

      {/* Schedule Display */}
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
                      {slot.name}: {slot.description}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </section>
      ))}

      {/* Add Entry Form */}
      {schedules.map((schedule, scheduleIndex) => (
        <section key={scheduleIndex}>
          <h2>Add Entry (doesn't work yet)</h2>

              {addEntry(schedules, scheduleIndex, 0, null)}
        </section>
      ))}


      {/* page links */}
      <Link to="/">Go to Home</Link>
      <Link to="/base">Go to Base</Link>
      <Link to="/schedules">Go to Schedules</Link>
      <Link to="/editor">Go to Editor</Link>
    </main>
)}

export default Schedules