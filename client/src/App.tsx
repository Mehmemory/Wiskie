import { useEffect, useState } from "react"
import { Navigate, Route, Routes } from "react-router-dom"

import type { ScheduleDto } from "../../shared/api-types"
import { DEFAULT_PROFILE_ID } from "../../shared/api-types"
import { getSchedules } from "./api"
import Schedules from "./pages/schedules"

// Owns the loaded profile schedule; the server remains the source of truth
// and sends a fresh snapshot after each successful edit.
function App() {
  const [schedules, setSchedules] = useState<ScheduleDto[]>([])

  useEffect(() => {
    // Load the selected profile once; changing profiles later belongs here.
    async function loadSchedules() {
      try {
        const response = await getSchedules(DEFAULT_PROFILE_ID)
        setSchedules(response.schedules)
      } catch (error) {
        console.error("Could not load schedules:", error)
      }
    }

    loadSchedules()
  }, [])

  return (
    <Routes>
      <Route
        path="/schedules"
        element={
          <Schedules
            schedules={schedules}
            onSchedulesChange={setSchedules}
          />
        }
      />
      <Route path="/" element={<Navigate to="/schedules" replace />} />
      <Route path="*" element={<Navigate to="/schedules" replace />} />
    </Routes>
  )
}

export default App
