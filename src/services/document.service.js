import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import Document from "../models/Document.js";
import Organization from "../models/Organization.js";
import Department from "../models/Department.js";

// ── Lazy S3 client ─────────────────────────────────────────────────────────
let s3Instance = null;
const getS3 = () => {
    if (!s3Instance) {
        s3Instance = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
    }
    return s3Instance;
};

const getBucket = () => process.env.AWS_BUCKET_NAME;

// ── Upload file to S3 ──────────────────────────────────────────────────────
const uploadToS3 = async (file, orgId) => {
    const s3 = getS3();
    const BUCKET = getBucket();
    const ext = path.extname(file.originalname);
    const uniqueKey = `organizations/${orgId}/documents/${uuidv4()}${ext}`;

    await s3.send(new PutObjectCommand({
        Bucket: BUCKET, Key: uniqueKey,
        Body: file.buffer, ContentType: file.mimetype,
    }));

    const signedUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: BUCKET, Key: uniqueKey }),
        { expiresIn: 7 * 24 * 60 * 60 }
    );

    return { key: uniqueKey, url: signedUrl };
};

// ── Delete file from S3 ────────────────────────────────────────────────────
const deleteFromS3 = async (s3Key) => {
    const s3 = getS3();
    const BUCKET = getBucket();
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: s3Key }));
};

// ── Upload Document ────────────────────────────────────────────────────────
const uploadDocument = async ({ file, userId, orgId, departmentId, visibility, description }) => {
    try {
        const { key, url } = await uploadToS3(file, orgId);
        const ext = path.extname(file.originalname).replace(".", "").toLowerCase();

        const document = await Document.create({
            name: file.originalname,
            originalName: file.originalname,
            description: description || null,
            fileType: ext,
            mimeType: file.mimetype,
            size: file.size,
            s3Key: key,
            s3Url: url,
            uploadedBy: userId,
            organization: orgId,
            department: departmentId || null,
            visibility: visibility || "DEPARTMENT",
            aiProcessingStatus: "PENDING",
        });

        await Organization.findByIdAndUpdate(orgId, {
            $inc: { "usage.totalDocuments": 1, "usage.storageUsed": file.size },
        });

        return document;
    } catch (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }
};

// ── Get all documents for an org ───────────────────────────────────────────
// Access rules:
//   ORG_ADMIN    → sees everything in the org
//   DEPT_MANAGER → sees: PUBLIC + own dept + cross-access depts + own PRIVATE
//   USER         → sees: PUBLIC + own dept + cross-access depts + own PRIVATE
//   VIEWER       → sees: PUBLIC only + own dept (read-only)
const getDocuments = async ({ orgId, departmentId, userId, role }) => {
    const query = { organization: orgId, isActive: true };

    if (role === "ORG_ADMIN") {
        // ORG_ADMIN sees everything — no extra filters
    } else if (role === "VIEWER") {
        // VIEWER sees only PUBLIC and their own department
        query.$or = [
            { visibility: "PUBLIC" },
            { department: departmentId, visibility: "DEPARTMENT" },
        ];
    } else {
        // DEPT_MANAGER and USER — apply cross-department access matrix
        // Step 1: find their home department with canAccessDepartments
        const homeDept = departmentId
            ? await Department.findById(departmentId).select("permissions.canAccessDepartments")
            : null;

        const allowedDeptIds = homeDept
            ? [departmentId, ...homeDept.permissions.canAccessDepartments.map(id => id.toString())]
            : departmentId ? [departmentId] : [];

        query.$or = [
            { visibility: "PUBLIC" },
            // own dept docs
            ...(departmentId ? [{ department: departmentId, visibility: "DEPARTMENT" }] : []),
            // cross-access dept docs
            ...(allowedDeptIds.length > 1
                ? [{ department: { $in: allowedDeptIds }, visibility: "DEPARTMENT" }]
                : []
            ),
            // own private docs
            { uploadedBy: userId, visibility: "PRIVATE" },
        ];
    }

    const documents = await Document.find(query)
        .populate("uploadedBy", "name email")
        .populate("department", "name icon code")
        .sort({ createdAt: -1 });

    return documents;
};

// ── Delete document ────────────────────────────────────────────────────────
const deleteDocument = async ({ documentId, userId, orgId, role }) => {
    const document = await Document.findOne({ _id: documentId, organization: orgId });
    if (!document) throw new Error("Document not found");

    if (role !== "ORG_ADMIN" && document.uploadedBy.toString() !== userId) {
        throw new Error("Not authorized to delete this document");
    }

    await deleteFromS3(document.s3Key);
    document.isActive = false;
    await document.save();

    await Organization.findByIdAndUpdate(orgId, {
        $inc: { "usage.totalDocuments": -1, "usage.storageUsed": -document.size },
    });

    return { message: "Document deleted successfully" };
};

export { uploadDocument, getDocuments, deleteDocument };