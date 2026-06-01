import * as documentService from "../services/document.service.js";

// POST /api/documents/upload
const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file provided" });
        }

        const { departmentId, visibility, description } = req.body;

        const document = await documentService.uploadDocument({
            file: req.file,
            userId: req.user.id,
            orgId: req.user.organizationId,
            departmentId,
            visibility,
            description,
        });

        res.status(201).json({ success: true, data: document });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// GET /api/documents
const getDocuments = async (req, res) => {
    try {
        const documents = await documentService.getDocuments({
            orgId: req.user.organizationId,
            departmentId: req.user.departmentId,
            userId: req.user.id,
            role: req.user.role,
        });

        res.status(200).json({ success: true, data: documents });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE /api/documents/:id
const deleteDocument = async (req, res) => {
    try {
        const result = await documentService.deleteDocument({
            documentId: req.params.id,
            userId: req.user.id,
            orgId: req.user.organizationId,
            role: req.user.role,
        });

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export { uploadDocument, getDocuments, deleteDocument };