import axios from "axios"

import type {
  ApiResponse,
  CreateTimeslotDto,
  SchedulesResponse,
} from "../../shared/api-types"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
})

export async function getApiResponse(): Promise<ApiResponse> {
  const response = await api.get<ApiResponse>("/api")
  return response.data
}

export async function incrementNumber(number: number): Promise<number> {
  const response = await api.post<{ number: number }>("/api/incriment", {
    number,
  })
  return response.data.number
}

export async function getSchedules(): Promise<SchedulesResponse> {
  const response = await api.get<SchedulesResponse>("/api/schedules")
  return response.data
}

export async function createTimeslot(
  timeslot: CreateTimeslotDto,
): Promise<SchedulesResponse> {
  const response = await api.post<SchedulesResponse>("/api/schedules", timeslot)
  return response.data
}
