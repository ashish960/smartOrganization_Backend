import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
    {
        // Basic Info
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        industry: {
            type: String,
            enum: [
                "TECHNOLOGY",
                "HEALTHCARE",
                "LEGAL",
                "FINANCE",
                "EDUCATION",
                "MANUFACTURING",
                "RETAIL",
                "OTHER",
            ],
            default: "OTHER",
        },
        size: {
            type: String,
            enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
            default: "1-10",
        },
        logo: {
            type: String,
            default: null,
        },
        website: {
            type: String,
            default: null,
        },

        // Owner
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Members
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        // Plan & Billing
        plan: {
            type: String,
            enum: ["STARTER", "PROFESSIONAL", "BUSINESS", "ENTERPRISE"],
            default: "STARTER",
        },
        billing: {
            status: {
                type: String,
                enum: ["ACTIVE", "SUSPENDED", "CANCELLED", "TRIAL"],
                default: "TRIAL",
            },
            trialEndsAt: {
                type: Date,
                default: () => new Date(+new Date() + 14 * 24 * 60 * 60 * 1000), // 14 days
            },
            nextBillingDate: Date,
            amount: Number,
            currency: {
                type: String,
                default: "USD",
            },
        },

        // Usage Tracking
        usage: {
            totalUsers: { type: Number, default: 0 },
            totalDocuments: { type: Number, default: 0 },
            storageUsed: { type: Number, default: 0 }, // in bytes
            aiQueriesUsed: { type: Number, default: 0 },
        },

        // Plan Limits
        limits: {
            maxUsers: { type: Number, default: 5 },
            maxDocuments: { type: Number, default: 50 },
            maxStorage: { type: Number, default: 1073741824 }, // 1GB in bytes
            maxAiQueries: { type: Number, default: 100 },
        },

        // Settings
        settings: {
            allowCrossDeptAccess: { type: Boolean, default: false },
            defaultDocumentVisibility: {
                type: String,
                enum: ["PUBLIC", "DEPARTMENT", "PRIVATE"],
                default: "DEPARTMENT",
            },
            requireApprovalForAccess: { type: Boolean, default: false },
            dataRetentionDays: { type: Number, default: 365 },
            mfaRequired: { type: Boolean, default: false },
            sessionTimeoutMinutes: { type: Number, default: 60 },
        },

        // Status
        isActive: { type: Boolean, default: true },
        onboardingCompleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Organization", organizationSchema);