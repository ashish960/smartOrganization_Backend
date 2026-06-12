import * as chatService from "../services/chat.service.js";
import Department from "../models/Department.js";

// GET /api/chat/sessions
const getSessions = async (req, res) => {
    try {
        const sessions = await chatService.getUserSessions({
            userId: req.user.id,
            orgId: req.user.organizationId,
            departmentId: req.user.departmentId,
        });
        res.status(200).json({ success: true, data: sessions });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// POST /api/chat/sessions
const createSession = async (req, res) => {
    try {
        const session = await chatService.createSession({
            userId: req.user.id,
            orgId: req.user.organizationId,
            departmentId: req.user.departmentId,
        });
        res.status(201).json({ success: true, data: session });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// GET /api/chat/sessions/:id
const getSession = async (req, res) => {
    try {
        const session = await chatService.getSession({
            sessionId: req.params.id,
            userId: req.user.id,
            orgId: req.user.organizationId,
        });
        res.status(200).json({ success: true, data: session });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

// POST /api/chat/sessions/:id/message
const sendMessage = async (req, res) => {
    try {
        const { question } = req.body;
        if (!question?.trim()) return res.status(400).json({ success: false, message: "Question is required" });

        // Get allowed departments from access matrix
        let allowedDeptIds = [];
        if (req.user.departmentId) {
            const dept = await Department.findById(req.user.departmentId)
                .select("permissions.canAccessDepartments");
            if (dept) {
                allowedDeptIds = dept.permissions.canAccessDepartments.map(id => id.toString());
            }
        }

        const result = await chatService.sendMessage({
            sessionId: req.params.id,
            question,
            userId: req.user.id,
            orgId: req.user.organizationId,
            departmentId: req.user.departmentId,
            allowedDeptIds,
            role: req.user.role,
        });

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE /api/chat/sessions/:id
const deleteSession = async (req, res) => {
    try {
        const result = await chatService.deleteSession({
            sessionId: req.params.id,
            userId: req.user.id,
            orgId: req.user.organizationId,
        });
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// PUT /api/chat/sessions/:id/rename
const renameSession = async (req, res) => {
    try {
        const { title } = req.body;
        if (!title?.trim()) return res.status(400).json({ success: false, message: "Title is required" });
        const session = await chatService.renameSession({
            sessionId: req.params.id,
            userId: req.user.id,
            orgId: req.user.organizationId,
            title,
        });
        res.status(200).json({ success: true, data: session });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export { getSessions, createSession, getSession, sendMessage, deleteSession, renameSession };