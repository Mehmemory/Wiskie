/** Stable key used to scope all schedule operations to a profile. */
export type ProfileId = string

/** Current single-profile default; replace with selected profile state later. */
export const DEFAULT_PROFILE_ID: ProfileId = "default"

/** A wall-clock time, represented without a date or timezone. */
export type DayDto = {
  hour: number
  minute: number
}

/** API representation of a persisted timeslot, including its server-owned ID. */
export type TimeslotDto = {
  id: string
  name: string
  weekday: number
  startTime: DayDto | null
  endTime: DayDto | null
  description: string
  priority: number
  freetime: boolean
}

/** Create/update payload. The server assigns the ID and requires concrete times. */
export type CreateTimeslotDto = Omit<
  TimeslotDto,
  "id" | "startTime" | "endTime"
> & {
  startTime: DayDto
  endTime: DayDto
}

/** One weekly schedule, grouped by weekday with Sunday at index zero. */
export type ScheduleDto = {
  timeslots: TimeslotDto[][]
}

/** Response envelope used by schedule read and mutation endpoints. */
export type SchedulesResponse = {
  schedules: ScheduleDto[]
}