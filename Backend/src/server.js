import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import logger from "./utils/logger.js";
import authRoute from "./routes/authRoute.js";
import noteRoute from "./routes/noteRoute.js";
import errorHandler from "./middleware/errorMiddleware.js";
import connectDB from "./db.js";

const app = express();

try {
  await connectDB();
} catch (error) {
  logger.error(`Failed to connect to database: ${error.message}`);
  process.exit(1);
}

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(pinoHttp({ logger }));

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoute);
app.use("/api/notes", noteRoute);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
