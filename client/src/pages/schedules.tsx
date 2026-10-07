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


function Schedules({ hope, schedules }: SchedulesProps) {
  return (
    <main>
      <h1>Schedules</h1>
      <p>This is the schedules page.</p>
      <ul>
        {hope.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      {schedules.map((schedule, scheduleIndex) => (
        <section key={scheduleIndex}>
          <h2>Schedule {scheduleIndex + 1}</h2>

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





      <Link to="/">Go to Home</Link>
      <Link to="/base">Go to Base</Link>
      <Link to="/schedules">Go to Schedules</Link>
      <Link to="/editor">Go to Editor</Link>
    </main>


)


}

export default Schedules