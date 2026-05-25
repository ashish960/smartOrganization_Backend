import mongoose from "mongoose";

const departmentTemplateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
        },
        icon: {
            type: String,
            default: "📁",
        },
        description: {
            type: String,
        },
        isMandatory: {
            type: Boolean,
            default: false,
        },
        defaultPermissions: {
            documentVisibility: {
                type: String,
                enum: ["PUBLIC", "DEPARTMENT", "RESTRICTED"],
                default: "DEPARTMENT",
            },
            canAccessDepartments: [String],
        },
        suggestedRoles: [String],
        industries: [String], // Which industries this is relevant for
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("DepartmentTemplate", departmentTemplateSchema);