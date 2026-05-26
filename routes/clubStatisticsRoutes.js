import express from "express";

import {
    getStatisticsOptions, getEventStatistics, finalizeEventStatistics, getMemberParticipationStatistics, recordClubPageVisit,
getClubVisitStatistics
} from "../controllers/clubStatisticsController.js";

const router = express.Router();

router.get("/options", getStatisticsOptions);

router.get("/events/:clubId", getEventStatistics);

router.post("/events/:eventId/finalize", finalizeEventStatistics);

router.get("/member-participation/:clubId", getMemberParticipationStatistics);

router.post("/visit/:clubId", recordClubPageVisit);

router.get("/visits/:clubId", getClubVisitStatistics);

export default router;