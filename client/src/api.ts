import axios from "axios"

import type {
  CreateTimeslotDto,
  ProfileId,
  SchedulesResponse,
} from "../../shared/api-types"
import { DEFAULT_PROFILE_ID } from "../../shared/api-types"

// Keep the service origin and HTTP details out of page components.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
})

// Encode path parameters so profile IDs cannot alter the route structure.
function profilePath(profileId: ProfileId): string {
  return `/api/profiles/${encodeURIComponent(profileId)}`
}

// Read the complete schedule snapshot for one profile.
export async function getSchedules(
  profileId: ProfileId = DEFAULT_PROFILE_ID,
): Promise<SchedulesResponse> {
  const response = await api.get<SchedulesResponse>(
    `${profilePath(profileId)}/schedules`,
  )
  return response.data
}

// Create a slot; the backend assigns its stable ID and validates its values.
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

// Replace a slot within the given profile. The profile and slot IDs together
// identify the resource, preventing an edit from crossing profile schedules.
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
