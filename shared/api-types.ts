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
}

export type ScheduleDto = {
  timeslots: TimeslotDto[][]
}

export type ApiResponse = {
  schedules: ScheduleDto[]
  hope: string[]
  message: string
}