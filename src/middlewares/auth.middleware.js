import { verifyAccessToken } from "../utils/jwt.js";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No authorization token provided",
            });
        }

        const decoded = verifyAccessToken(token);

        // Get full user with organization
        const user = await User.findById(decoded.id).select("-password");

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "User not found or inactive",
            });
        }

        // Attach user info to request
        req.user = {
            id: user._id,
            email: user.email,
            role: user.role,
            organizationId: user.organization,
            departmentId: user.department,
            onboardingCompleted: user.onboardingCompleted,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

// Role based authorization
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to perform this action",
            });
        }
        next();
    };
};