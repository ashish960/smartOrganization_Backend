import express from "express";
import { uploadDocument, getDocuments, deleteDocument } from "../controllers/document.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

// All document routes require authentication
router.use(authenticate);

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/", getDocuments);
router.delete("/:id", deleteDocument);

export default router;