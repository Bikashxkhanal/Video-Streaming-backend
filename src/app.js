import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//configuration are doneu use app.use
app.use(
  express.json({
    // for file submmited like photos
    limit: "30kb",
  })
);

app.use(express.urlencoded({ extended: true, limit: "16kb" })); // for url request like searching, pagination , filtering

//this for keeping the file uploaded in folder : public
app.use(express.static("public"));

app.use(cookieParser()); // cookies can be set and removed by the server

//routes import
import userRouter from "./routes/user.route.js";

app.use("/api/v1/users", userRouter);

export { app };
