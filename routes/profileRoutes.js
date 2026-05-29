import express from "express";

import {
    getProfile,
    checkUsernameAvailability,
    updateUsername,
    updateProfileImage,
    updateInterests,
    updateBio,
    getUserClubs,
    leaveClub
} from "../controllers/profileController.js";

const router = express.Router();

router.get("/check-username/:username", checkUsernameAvailability);

router.get("/:userId", getProfile);

router.patch("/:userId/username", updateUsername);

router.patch("/:userId/image", updateProfileImage);

router.patch("/:userId/interests", updateInterests);

router.patch("/:userId/bio", updateBio);

router.get("/:userId/clubs", getUserClubs);

router.delete("/:userId/clubs/:clubId", leaveClub);

export default router;