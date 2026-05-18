import jwt from "jsonwebtoken";

const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        throw new Error(`Token verification failed: ${error.message}`);
    }
};

const authenticate = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "No authorization token provided",
            });
        }

        // Extract token from "Bearer <token>"
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Invalid token format",
            });
        }

        // Verify token
        const decoded = verifyToken(token);

        // Attach user info to request object
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};

export { authenticate, verifyToken };