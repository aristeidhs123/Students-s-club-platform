import express from "express";
import { createInternalActivity, deleteInternalActivity, updateInternalActivity, participateInActivity, declareAvailability, getActivityAttendance, getActivityAvailability } from "../controllers/internalActivityController.js";

const router = express.Router();

router.post("/", createInternalActivity);

router.delete("/:activityId", deleteInternalActivity);

router.patch("/:activityId", updateInternalActivity);

router.post("/:activityId/participate", participateInActivity);

router.post("/:activityId/availability", declareAvailability);

router.get("/:activityId/attendance", getActivityAttendance);

router.get("/:activityId/availability", getActivityAvailability);

export default router;