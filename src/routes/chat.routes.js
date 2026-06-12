import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getSessions, createSession, getSession, sendMessage, deleteSession, renameSession } from "../controllers/chat.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/sessions", getSessions);
router.post("/sessions", createSession);
router.get("/sessions/:id", getSession);
router.post("/sessions/:id/message", sendMessage);
router.delete("/sessions/:id", deleteSession);
router.put("/sessions/:id/rename", renameSession);

export default router;