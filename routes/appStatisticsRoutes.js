import express from "express";

import {
    getAppStatisticsOptions,
    getChatbotUsageStatistics,
    getChatbotEfficiencyStatistics,
    getAppUsageStatistics
} from "../controllers/appStatisticsController.js";

const router = express.Router();

router.get("/options", getAppStatisticsOptions);

router.get("/chatbot-usage", getChatbotUsageStatistics);

router.get("/chatbot-efficiency", getChatbotEfficiencyStatistics);

router.get("/app-usage", getAppUsageStatistics);

export default router;