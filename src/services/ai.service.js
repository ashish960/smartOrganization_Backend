import fetch from "node-fetch";

const AI_URL = () => process.env.AI_SERVICE_URL || "http://localhost:8000";
const AI_KEY = () => process.env.AI_INTERNAL_KEY;

// Called when a document is uploaded — triggers processing
export const processDocument = async ({ documentId, s3Url, fileType, orgId, departmentId, visibility }) => {
    const res = await fetch(`${AI_URL()}/api/ai/process-document`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-internal-key": AI_KEY() },
        body: JSON.stringify({
            document_id: documentId,
            s3_url: s3Url,
            file_type: fileType,
            org_id: orgId,
            department_id: departmentId || null,
            visibility: visibility || "DEPARTMENT",
        }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.detail || "AI processing failed");
    return data;
};

export const deleteDocumentVectors = async (documentId) => {
    await fetch(`${AI_URL()}/api/ai/document/${documentId}`, {
        method: "DELETE",
        headers: { "x-internal-key": AI_KEY() },
    });
};

export const chatWithDocs = async ({ question, orgId, departmentId, allowedDeptIds, conversationHistory, userId, role }) => {
    const res = await fetch(`${AI_URL()}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-internal-key": AI_KEY() },
        body: JSON.stringify({
            question,
            org_id: orgId,
            department_id: departmentId || null,
            allowed_dept_ids: allowedDeptIds || [],
            conversation_history: conversationHistory || [],
            user_id: userId,
            role,
        }),
    });
    const data = await res.json();
    if (!data.answer) throw new Error(data.detail || "Chat failed");
    return data;
};