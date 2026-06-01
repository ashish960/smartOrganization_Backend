import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        // Basic Info
        name: {
            type: String,
            required: true,
            trim: true,
        },
        originalName: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: null,
        },

        // File Info
        fileType: {
            type: String,
            required: true, // pdf, docx, xlsx, png, etc.
        },
        mimeType: {
            type: String,
            required: true,
        },
        size: {
            type: Number,
            required: true, // in bytes
        },

        // S3 Storage
        s3Key: {
            type: String,
            required: true, // path inside S3 bucket
        },
        s3Url: {
            type: String,
            required: true, // full public/signed URL
        },

        // Ownership
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            default: null,
        },

        // Access Control
        visibility: {
            type: String,
            enum: ["PUBLIC", "DEPARTMENT", "PRIVATE"],
            default: "DEPARTMENT",
        },

        // AI Processing
        aiProcessed: {
            type: Boolean,
            default: false,
        },
        aiProcessingStatus: {
            type: String,
            enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
            default: "PENDING",
        },
        vectorIds: [String], // Pinecone vector IDs after processing

        // Status
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Document", documentSchema);