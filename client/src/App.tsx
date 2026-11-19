import { useState, useEffect } from 'react'

import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Base from "./pages/Base"
import Schedules from "./pages/schedules"
import Editor from "./pages/editor"
import { getApiResponse, getSchedules } from "./api"
import type { ScheduleDto } from "../../shared/api-types"
import { DEFAULT_PROFILE_ID } from "../../shared/api-types"


// Loads shared app data and renders the application's route configuration.
function App() {

  const [schedules, setSchedules] = useState<ScheduleDto[]>([])

  // Loads the initial schedule once when the app mounts.
  useEffect(() => {
    // Requests the current schedule and stores it for the routes to display.
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


  const [hope, setHope] = useState<string[]>([])

  // Fetches the API greeting and sample values for the home page.
  useEffect(() => {
    async function loadApiResponse() {
      try {
        const response = await getApiResponse()
        setHope(response.hope)
        console.log(response.message)
      } catch (error) {
        console.error("Error fetching API:", error)
      }
    }

    loadApiResponse()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home hope={hope} />} />
        <Route path="/base" element={<Base />} />
        <Route
          path="/schedules"
          element={
            <Schedules
              schedules={schedules}
              onSchedulesChange={setSchedules}
            />
          }
        />
        <Route path="/editor" element={<Editor />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
