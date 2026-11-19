import axios from "axios"

import type {
  ApiResponse,
  CreateTimeslotDto,
  ProfileId,
  SchedulesResponse,
} from "../../shared/api-types"
import { DEFAULT_PROFILE_ID } from "../../shared/api-types"

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

function profilePath(profileId: ProfileId): string {
  return `/api/profiles/${encodeURIComponent(profileId)}`
}

export async function getSchedules(
  profileId: ProfileId = DEFAULT_PROFILE_ID,
): Promise<SchedulesResponse> {
  const response = await api.get<SchedulesResponse>(
    `${profilePath(profileId)}/schedules`,
  )
  return response.data
}

export async function createTimeslot(
  profileId: ProfileId,
  timeslot: CreateTimeslotDto,
): Promise<SchedulesResponse> {
  const response = await api.post<SchedulesResponse>(
    `${profilePath(profileId)}/timeslots`,
    timeslot,
  )
  return response.data
}

export async function updateTimeslot(
  profileId: ProfileId,
  timeslotId: string,
  timeslot: CreateTimeslotDto,
): Promise<SchedulesResponse> {
  const response = await api.put<SchedulesResponse>(
    `${profilePath(profileId)}/timeslots/${encodeURIComponent(timeslotId)}`,
    timeslot,
  )
  return response.data
}
