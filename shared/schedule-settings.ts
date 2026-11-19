/**
 * Default policy for creating and editing timeslots.
 * A future settings store can supply profile-specific values instead.
 */
export const DEFAULT_SCHEDULE_SETTINGS = {
  allowNegativePriority: false,
  maxTimeslotNameLength: 100,
} as const

export type ScheduleSettings = {
  allowNegativePriority: boolean
  maxTimeslotNameLength: number
}
