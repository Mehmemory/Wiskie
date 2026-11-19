# Wiskie

Wiskie is a React client and an Express API for viewing and editing schedule
timeslots. The `client`, `server`, and `shared` directories are separate parts
of one application; the client and server each have their own package setup.

## Architecture

```mermaid
flowchart LR
  person[User] --> browser[Browser]
  browser -->|serves app| vite[Vite dev server :5173]
  vite --> react[React app]

  subgraph client[client/src]
    entry[main.tsx] --> app[App.tsx<br/>router and schedule state]
    app --> home[Home route]
    app --> schedules[Schedules route]
    app --> base[Base route<br/>placeholder]
    app --> editor[Editor route<br/>placeholder]
    home --> clientApi[api.ts<br/>Axios client]
    app --> clientApi
    schedules --> clientApi
  end
  react --> entry

  clientApi -->|GET /api| api
  clientApi -->|POST /api/incriment| api
  clientApi -->|GET profile schedule| api
  clientApi -->|POST new timeslot| api
  clientApi -->|PUT existing timeslot| api
  api -->|updated profile schedule| app

  subgraph server[server]
    api[Express API :8080]
    api --> validation[Request validation]
    validation --> store[ProfileScheduleStore]
    store --> schedule[Schedule per profile]
    schedule --> slots[Timeslot instances]
    slots --> day[Day values]
    store --> memory[(In-memory profile schedules)]
  end

  types[shared/api-types.ts]
  types -. compile-time DTO contract .-> app
  types -. compile-time DTO contract .-> schedules
  types -. compile-time DTO contract .-> api
```

### Current request flow

- `main.tsx` mounts the React app. `App.tsx` defines the routes and fetches the
  initial schedule and greeting data when it mounts.
- The home page displays the greeting and has a demo increment request.
- The schedules page displays timeslots by weekday and lets the user add or
  edit a specific entry. After each save, the server returns the updated
  profile schedule and the client replaces its schedule state.
- `client/src/api.ts` owns the Axios instance and endpoint paths. Set
  `VITE_API_BASE_URL` to override its default API origin of
  `http://localhost:8080`.
- The API validates create and update requests, converts them to `Day` and
  `Timeslot` domain objects, and stores them in a profile-scoped `Schedule`.
- Schedule endpoints are `GET /api/profiles/:profileId/schedules`,
  `POST /api/profiles/:profileId/timeslots`, and
  `PUT /api/profiles/:profileId/timeslots/:timeslotId`. The current client uses
  the `default` profile. The profile-keyed store is an extension point, not
  profile management or access control; authorization and durable storage are
  not implemented.
- `shared/api-types.ts` describes the JSON shapes used on both sides, including
  the stricter `CreateTimeslotDto` required by the create endpoint. These
  TypeScript types do not validate network data at runtime.

## Current gaps

- Profile schedules exist only in server memory. Restarting the server resets
  them, including the default profile's sample timeslot.
- The server CORS configuration is restricted to the Vite development origin;
  deployments will need an explicit allowed-origin configuration.
- `Base` and `Editor` are placeholder pages. The increment and greeting
  endpoints are demo functionality rather than schedule features.
- The server warns about overlapping timeslots but still adds them. The
  product behavior for conflicts has not been chosen yet.

These are the current implementation boundaries, not promises about the final
design. Next, decide the desired schedule persistence and overlap behavior
before extending the editor further.

## Run locally

Install dependencies in both packages, then run each development server in a
separate terminal:

```sh
cd server
npm install
npm run dev
```

```sh
cd client
npm install
npm run dev
```

The client runs on `http://localhost:5173` and the API on
`http://localhost:8080`.
