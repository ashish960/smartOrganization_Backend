const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateToken } = require("../utils/jwt");

// REGISTER USER
const registerUser = async ({ name, email, password }) => {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    // Generate token
    const token = generateToken({
        id: user._id,
        role: user.role,
    });

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
};

// LOGIN USER
const loginUser = async ({ email, password }) => {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("Invalid credentials");
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid credentials");
    }

    // Generate token
    const token = generateToken({
        id: user._id,
        role: user.role,
    });

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
};

module.exports = {
    registerUser,
    loginUser,
};