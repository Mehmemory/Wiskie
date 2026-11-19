import type { ProfileId } from "../../shared/api-types"
import { Schedule } from "./schedule"

/**
 * In-memory ownership boundary between profiles and their schedules.
 * Replace the map implementation with persistence without changing route scope.
 */
export class ProfileScheduleStore {
  private readonly schedules = new Map<ProfileId, Schedule>()

  /** Get an existing schedule or initialize an empty one for a new profile. */
  get(profileId: ProfileId): Schedule {
    let schedule = this.schedules.get(profileId)
    if (!schedule) {
      schedule = new Schedule()
      this.schedules.set(profileId, schedule)
    }

    return schedule
  }

  /** Look up without creating; updates use this to avoid editing missing profiles. */
  find(profileId: ProfileId): Schedule | undefined {
    return this.schedules.get(profileId)
  }
}
