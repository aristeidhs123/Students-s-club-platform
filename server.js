import express from "express";
import db from "./config/db.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import internalScheduleRoutes from "./routes/internalScheduleRoutes.js";
import internalActivityRoutes from "./routes/internalActivityRoutes.js";
import internalPermissionRoutes from "./routes/internalPermissionRoutes.js";

const app = express();

app.use(express.json());

app.use("/api/chatbot", chatbotRoutes);

app.use("/api/internal-schedules", internalScheduleRoutes);

app.use("/api/internal-activities", internalActivityRoutes);

app.use("/api/internal-permissions", internalPermissionRoutes);

app.get("/", (req, res) => {
    res.send("Backend works!");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
