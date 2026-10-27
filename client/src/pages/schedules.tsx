import { Link } from "react-router-dom";

import type { DayDto, ScheduleDto } from "../../../shared/api-types"


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

    {/* temp form submission */}
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const name = formData.get("name") as string;
      const message = formData.get("message") as string;
      const startTime = formData.get("startTime") as string;
      const endTime = formData.get("endTime") as string;
      const day = formData.get("day") as string;
      const freetime = formData.get("freetime") as string;
      const priority = formData.get("priority") as string;

      alert(`Form submitted with values:\nName: ${name}\nDescription: ${message}\nStart Time: ${startTime}\nEnd Time: ${endTime}\nDay: ${day}\nFreetime: ${freetime}\nPriority: ${priority}`);
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
        Day: <input type="text" name="day" />
      </label>
        <label>
        Freetime: <input type="boolean" name="freetime" />
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