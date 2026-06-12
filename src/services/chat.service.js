import ChatSession from "../models/ChatSession.js";
import { chatWithDocs } from "./ai.service.js";

// ── Create new session ─────────────────────────────────────────────────────
export const createSession = async ({ userId, orgId, departmentId }) => {
    const session = await ChatSession.create({
        user: userId,
        organization: orgId,
        department: departmentId || null,
        messages: [],
        title: "New Conversation",
    });
    return session;
};

// ── Get all sessions for user ──────────────────────────────────────────────
export const getUserSessions = async ({ userId, orgId, departmentId }) => {
    const query = {
        user: userId,
        organization: orgId,
        isActive: true,
    };

    // Filter by department if provided
    if (departmentId) query.department = departmentId;

    const sessions = await ChatSession.find(query)
        .select("title messages createdAt updatedAt department")
        .populate("department", "name icon")
        .sort({ updatedAt: -1 })
        .limit(50);

    return sessions;
};

// ── Get single session ─────────────────────────────────────────────────────
export const getSession = async ({ sessionId, userId, orgId }) => {
    const session = await ChatSession.findOne({
        _id: sessionId,
        user: userId,
        organization: orgId,
        isActive: true,
    }).populate("department", "name icon");

    if (!session) throw new Error("Session not found");
    return session;
};

// ── Send message in session ────────────────────────────────────────────────
export const sendMessage = async ({
    sessionId, question, userId, orgId,
    departmentId, allowedDeptIds, role,
}) => {
    // Get session
    const session = await ChatSession.findOne({
        _id: sessionId, user: userId, organization: orgId, isActive: true,
    });
    if (!session) throw new Error("Session not found");

    // Build conversation history from existing messages
    const conversationHistory = session.messages.map(m => ({
        role: m.role,
        content: m.content,
    }));

    // Call AI service
    const result = await chatWithDocs({
        question,
        orgId: orgId.toString(),
        departmentId: departmentId?.toString() || null,
        allowedDeptIds: allowedDeptIds || [],
        conversationHistory: conversationHistory,
        userId: userId.toString(),
        role,
    });

    // Save both messages to session
    session.messages.push({ role: "user", content: question, sources: [] });
    session.messages.push({ role: "assistant", content: result.answer, sources: result.sources });
    await session.save();

    // Track AI query in org usage
    const { default: Organization } = await import("../models/Organization.js");
    await Organization.findByIdAndUpdate(orgId, {
        $inc: { "usage.aiQueriesUsed": 1 },
    });

    return {
        answer: result.answer,
        sources: result.sources,
        sessionId: session._id,
        title: session.title,
    };
};

// ── Delete session ─────────────────────────────────────────────────────────
export const deleteSession = async ({ sessionId, userId, orgId }) => {
    const session = await ChatSession.findOne({
        _id: sessionId, user: userId, organization: orgId,
    });
    if (!session) throw new Error("Session not found");
    session.isActive = false;
    await session.save();
    return { message: "Session deleted" };
};

// ── Rename session ─────────────────────────────────────────────────────────
export const renameSession = async ({ sessionId, userId, orgId, title }) => {
    const session = await ChatSession.findOneAndUpdate(
        { _id: sessionId, user: userId, organization: orgId },
        { title },
        { new: true }
    );
    if (!session) throw new Error("Session not found");
    return session;
};