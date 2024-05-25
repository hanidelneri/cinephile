import express, { Request, Response } from "express";

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Sample GET route
app.get("/api/movies", (req: Request, res: Response) => {
  res.json({ message: "List of movies" });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
