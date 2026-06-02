import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import { generateToken } from "../utils/jwt.js";

// Generate unique slug: "Acme Corp" → "acme-corp-x4k2"
const generateSlug = (companyName) => {
    const base = companyName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    const suffix = Math.random().toString(36).substring(2, 6);
    return `${base}-${suffix}`;
};

const registerUser = async ({ name, email, password, companyName, industry, companySize }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("User already exists");

    const userId = new mongoose.Types.ObjectId();
    const slug = generateSlug(companyName);

    const organization = await Organization.create({
        name: companyName, slug, industry, size: companySize,
        plan: "STARTER", billing: { status: "TRIAL" },
        owner: userId, members: [userId], usage: { totalUsers: 1 },
    });

    const user = await User.create({
        _id: userId, name, email, password,
        role: "ORG_ADMIN", organization: organization._id, onboardingCompleted: false,
    });

    const token = generateToken({ id: user._id, role: user.role, orgId: organization._id });

    return {
        user: {
            id: user._id, name: user.name, email: user.email, role: user.role,
            organization: { id: organization._id, name: organization.name, slug: organization.slug, industry: organization.industry, size: organization.size, plan: organization.plan },
            onboardingCompleted: user.onboardingCompleted,
        },
        token,
    };
};

const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email })
        .select("+password")
        .populate("organization", "name slug industry size plan billing onboardingCompleted");

    if (!user) throw new Error("Invalid credentials");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error("Invalid credentials");

    const token = generateToken({ id: user._id, role: user.role, orgId: user.organization?._id || null });

    return {
        user: {
            id: user._id, name: user.name, email: user.email, role: user.role,
            organization: user.organization || null, onboardingCompleted: user.onboardingCompleted,
        },
        token,
    };
};

// ── Add member directly (ORG_ADMIN only) ──────────────────────────────────
// Creates a new user account under the same org — no invite email needed
const addMember = async ({ orgId, name, email, role, jobTitle, departmentId, addedById }) => {

    // 1. Check org exists
    const org = await Organization.findById(orgId);
    if (!org) throw new Error("Organization not found");

    // 2. Check email not already taken
    const existing = await User.findOne({ email });
    if (existing) throw new Error("A user with this email already exists");

    // 3. Create user with a temporary password — they should change it on first login
    const tempPassword = `SmartOrg@${Math.random().toString(36).substring(2, 8)}`;

    const user = await User.create({
        name,
        email,
        password: tempPassword,          // pre-save hook hashes it
        role: role || "USER",
        organization: orgId,
        department: departmentId || null,
        jobTitle: jobTitle || null,
        onboardingCompleted: false,
        isEmailVerified: false,
    });

    // 4. Add to org members list + update usage
    await Organization.findByIdAndUpdate(orgId, {
        $push: { members: user._id },
        $inc: { "usage.totalUsers": 1 },
    });

    // 5. If department specified, add to dept members
    if (departmentId) {
        const { default: Department } = await import("../models/Department.js");
        await Department.findByIdAndUpdate(departmentId, {
            $push: { members: user._id },
        });
        await User.findByIdAndUpdate(user._id, { department: departmentId });
    }

    return {
        user: {
            id: user._id, name: user.name, email: user.email,
            role: user.role, jobTitle: user.jobTitle,
        },
        tempPassword, // return so admin can share with the new member
    };
};

export { registerUser, loginUser, addMember };