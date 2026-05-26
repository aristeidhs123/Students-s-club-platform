import express from "express";

import {
    getCompletedEventsForReview,
    createEventReview,
    getPublicEventReviews
} from "../controllers/eventReviewController.js";

const router = express.Router();

router.get("/completed/:userId", getCompletedEventsForReview);

router.post("/:eventId", createEventReview);

router.get("/public/:eventId", getPublicEventReviews);

export default router;