import express from "express";
import cookieparser from "cookie-parser";
const app = express();

app.use(express.json())
app.use(cookieparser());

//router imports
import healthCheckRouter from "./routes/healthcheck.routes.js"
import Authentication from "./routes/auth.routes.js";
import Project from "./routes/project.routes.js";

app.use("/api/v1/healthcheck", healthCheckRouter)
app.use("/api/v1/healthcheck", Authentication)
app.use("/api/v1/healthcheck/project", Project)

export default app;
