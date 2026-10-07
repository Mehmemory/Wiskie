import { useState, useEffect } from 'react'

import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Base from "./pages/Base"
import Schedules from "./pages/schedules"
import Editor from "./pages/editor"
import axios from 'axios' 
import type { ApiResponse } from "../../shared/api-types"


const response = await axios.get<ApiResponse>(
  "http://localhost:8080/api/schedules"
)

console.log(response.data.schedules)

function App() {

  const [hope, setHope] = useState<string[]>([])

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

  useEffect(() => {
    fetchApi();
  }, []);




  

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home hope={hope} />} />
        <Route path="/base" element={<Base />} />
        <Route path="/schedules" element={<Schedules hope={hope} />} />
        <Route path="/editor" element={<Editor />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
