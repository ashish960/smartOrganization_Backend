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
    console.log("i am inside register user");
    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error("User already exists");
    }
    console.log("No existing user found, proceeding with registration");
    // 2. Pre-generate a userId so we can satisfy org.owner (required) immediately
    const userId = new mongoose.Types.ObjectId();

    // 3. Create Organization — owner is required so pass userId upfront
    const slug = generateSlug(companyName);
    console.log("Generated slug:", slug);
    const organization = await Organization.create({
        name: companyName,
        slug,
        industry,
        size: companySize,
        plan: "STARTER",
        billing: { status: "TRIAL" },
        owner: userId,
        members: [userId],
        usage: { totalUsers: 1 },
    });

    console.log("Organization created with ID:", organization._id);

    // 4. Create User linked to the org
    const user = await User.create({
        _id: userId,
        name,
        email,
        password,                   // plain — pre-save hook on schema hashes it
        role: "ORG_ADMIN",
        organization: organization._id,
        onboardingCompleted: false,
    });
    console.log("User created with ID:", user._id);

    // 5. Generate JWT
    const token = generateToken({
        id: user._id,
        role: user.role,
        orgId: organization._id,
    });

    console.log("Generated token:", token);

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            organization: {
                id: organization._id,
                name: organization.name,
                slug: organization.slug,
                industry: organization.industry,
                size: organization.size,
                plan: organization.plan,
            },
            onboardingCompleted: user.onboardingCompleted,
        },
        token,
    };
};

const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email })
        .select("+password")
        .populate("organization", "name slug industry size plan billing onboardingCompleted");

    if (!user) {
        throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid credentials");
    }

    const token = generateToken({
        id: user._id,
        role: user.role,
        orgId: user.organization?._id || null,
    });

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            organization: user.organization || null,
            onboardingCompleted: user.onboardingCompleted,
        },
        token,
    };
};

export { registerUser, loginUser };