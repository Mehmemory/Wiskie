export type ProfileId = string

export const DEFAULT_PROFILE_ID: ProfileId = "default"

export type DayDto = {
  hour: number
  minute: number
}

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

export type CreateTimeslotDto = Omit<
  TimeslotDto,
  "id" | "startTime" | "endTime"
> & {
  startTime: DayDto
  endTime: DayDto
}

export type ScheduleDto = {
  timeslots: TimeslotDto[][]
}

export type ApiResponse = {
  hope: string[]
  message: string
}

export type SchedulesResponse = {
  schedules: ScheduleDto[]
}