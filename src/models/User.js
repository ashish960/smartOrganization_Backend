import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        // Basic Info
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },

        // Role (platform level)
        role: {
            type: String,
            enum: ["SUPER_ADMIN", "ORG_ADMIN", "DEPT_MANAGER", "USER", "VIEWER"],
            default: "USER",
        },

        // Organization & Department
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            default: null,
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            default: null,
        },

        // Profile
        profileImage: {
            type: String,
            default: null,
        },
        jobTitle: {
            type: String,
            default: null,
        },
        phone: {
            type: String,
            default: null,
        },

        // Status
        isActive: {
            type: Boolean,
            default: true,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        onboardingCompleted: {
            type: Boolean,
            default: false,
        },

        // Security
        lastLogin: {
            type: Date,
            default: null,
        },
        loginHistory: [
            {
                loginAt: Date,
                ipAddress: String,
                device: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);