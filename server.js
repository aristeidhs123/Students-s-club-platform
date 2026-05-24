import express from "express";
import db from "./config/db.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";

const app = express();

app.use(express.json());

app.use("/api/chatbot", chatbotRoutes);

app.get("/", (req, res) => {
    res.send("Backend works!");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});