import { useState, useEffect } from 'react'

import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Base from "./pages/Base"
import Schedules from "./pages/schedules"
import Editor from "./pages/editor"
import axios from 'axios' 
import type { ApiResponse, ScheduleDto, SchedulesResponse } from "../../shared/api-types"


// Loads shared app data and renders the application's route configuration.
function App() {

  const [schedules, setSchedules] = useState<ScheduleDto[]>([])

  // Loads the initial schedule once when the app mounts.
  useEffect(() => {
    // Requests the current schedule and stores it for the routes to display.
    async function loadSchedules() {
      try {
        const response = await axios.get<SchedulesResponse>(
          "http://localhost:8080/api/schedules",
        )
        setSchedules(response.data.schedules)
      } catch (error) {
        console.error("Could not load schedules:", error)
      }
    }

    loadSchedules()
  }, [])


  const [hope, setHope] = useState<string[]>([])

  // Fetches the API greeting and sample values for the home page.
  const fetchApi = async () => {
    try {
      const response = await axios.get<ApiResponse>('http://localhost:8080/api');
      setHope(response.data.hope);
      console.log(response.data.message);
    }
    catch (error) {
      console.error('Error fetching API:', error);
    }
  };

  // Loads the greeting data once when the app mounts.
  useEffect(() => {
    fetchApi();
  }, []);




  

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home hope={hope} />} />
        <Route path="/base" element={<Base />} />
        <Route
          path="/schedules"
          element={
            <Schedules
              hope={hope}
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
