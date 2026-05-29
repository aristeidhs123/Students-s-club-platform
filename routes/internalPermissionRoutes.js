import express from "express";

import {
    grantActivityPermission
} from "../controllers/internalPermissionController.js";

const router = express.Router();

router.post("/", grantActivityPermission);

export default router;