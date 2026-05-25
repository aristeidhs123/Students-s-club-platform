import express from "express";
import { createInternalSchedule } from "../controllers/internalScheduleController.js";

const router = express.Router();

router.post("/", createInternalSchedule);

export default router;