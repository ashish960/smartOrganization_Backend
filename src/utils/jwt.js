import jwt from "jsonwebtoken";

// Generate token
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

// Verify token
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error(`Token verification failed: ${error.message}`);
    }
};

export { generateToken, verifyAccessToken };