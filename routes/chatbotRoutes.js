import express from "express";
import { askChatbot, contactAdmin, getUnreadAdminMessages, answerAdminMessage, getUserChatbotHistory, closeConversation } from "../controllers/chatbotController.js";

const router = express.Router();

router.post("/ask", askChatbot);

router.post("/contact-admin", contactAdmin);

router.get("/admin/unread", getUnreadAdminMessages);

router.patch("/admin/answer/:contactId", answerAdminMessage);

router.get("/user/:userId", getUserChatbotHistory);

router.patch("/close/:messageId", closeConversation);

export default router;