import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
    {
        // Who did it
        user: {
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

        // What they did
        action: {
            type: String,
            enum: [
                "LOGIN",
                "LOGOUT",
                "DOCUMENT_UPLOAD",
                "DOCUMENT_VIEW",
                "DOCUMENT_DELETE",
                "AI_QUERY",
                "USER_INVITE",
                "USER_REMOVE",
                "DEPARTMENT_CREATE",
                "DEPARTMENT_UPDATE",
                "PERMISSION_CHANGE",
                "SETTINGS_UPDATE",
            ],
            required: true,
        },

        // Details
        details: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        // Technical info
        ipAddress: String,
        userAgent: String,

        // Status
        status: {
            type: String,
            enum: ["SUCCESS", "FAILED", "PENDING"],
            default: "SUCCESS",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("ActivityLog", activityLogSchema);