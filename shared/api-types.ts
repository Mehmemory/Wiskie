export type DayDto = {
  hour: number
  minute: number
}

export type TimeslotDto = {
  name: string
  weekday: number
  startTime: DayDto | null
  endTime: DayDto | null
  description: string
  priority: number
  freetime: boolean
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