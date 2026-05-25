import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        code: {
            type: String,
            required: true,
            uppercase: true,
        },
        icon: {
            type: String,
            default: "📁",
        },
        description: {
            type: String,
        },

        // Organization this belongs to
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },

        // Template reference
        isFromTemplate: {
            type: Boolean,
            default: false,
        },
        templateRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DepartmentTemplate",
            default: null,
        },
        isMandatory: {
            type: Boolean,
            default: false,
        },

        // People
        head: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        // Permissions
        permissions: {
            documentVisibility: {
                type: String,
                enum: ["PUBLIC", "DEPARTMENT", "RESTRICTED"],
                default: "DEPARTMENT",
            },
            canAccessDepartments: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Department",
                },
            ],
            customRules: [
                {
                    targetDepartment: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Department",
                    },
                    accessLevel: {
                        type: String,
                        enum: ["READ", "WRITE", "NONE"],
                        default: "NONE",
                    },
                    requiresApproval: {
                        type: Boolean,
                        default: false,
                    },
                },
            ],
        },

        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

// Ensure department code is unique within organization
departmentSchema.index(
    { organization: 1, code: 1 },
    { unique: true }
);

export default mongoose.model("Department", departmentSchema);