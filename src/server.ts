import express, { Request, Response } from "express";
import { showTimeRepository } from "./repository/showtime.js";

const app = express();
const port = 3000;

app.use(express.json());

app.get("/api/movies", async (req: Request, res: Response) => {
  const { start, end, version } = req.query;
  const showtimes = await new showTimeRepository().getShowTime(
    new Date(start as string),
    new Date(end as string),
    version as string
  );

  res.json(showtimes);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
