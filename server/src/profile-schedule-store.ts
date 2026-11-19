import type { ProfileId } from "../../shared/api-types"
import { Schedule } from "./schedule"

export class ProfileScheduleStore {
  private readonly schedules = new Map<ProfileId, Schedule>()

  get(profileId: ProfileId): Schedule {
    let schedule = this.schedules.get(profileId)
    if (!schedule) {
      schedule = new Schedule()
      this.schedules.set(profileId, schedule)
    }

    return schedule
  }

  find(profileId: ProfileId): Schedule | undefined {
    return this.schedules.get(profileId)
  }
}
