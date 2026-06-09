import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { chatWithDocs } from "../services/ai.service.js";

const router = express.Router();

router.use(authenticate);

router.post("/", async (req, res) => {
    try {
        const { question, conversationHistory } = req.body;
        if (!question) return res.status(400).json({ success: false, message: "Question is required" });

        const result = await chatWithDocs({
            question,
            orgId: req.user.organizationId,
            departmentId: req.user.departmentId,
            allowedDeptIds: [],   // TODO: fetch from dept access matrix
            conversationHistory: conversationHistory || [],
            userId: req.user.id,
            role: req.user.role,
        });

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;