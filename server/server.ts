import cors from "cors";
import express from "express";
import { Schedule } from "./src/schedule"

const app = express();
const corsOptions = {
    origin: ["http://localhost:5173"]
};

app.use(cors(corsOptions));

app.get("/api", (_req, res) => {
    res.json({
        message: "Hello from server!",
        hope: ["this", "works", "now"]
    });
});

app.get("/api/schedules", (_req, res) => {
  const response = {
    schedules: [
      {
        timeslots: [[], [], [], [], [], [], []],
      },
    ],
  }

  res.json(response)
})

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});