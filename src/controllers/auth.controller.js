import * as authService from "../services/auth.service.js";

const register = async (req, res) => {
    try {
        const result = await authService.registerUser(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const result = await authService.loginUser(req.body);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        res.status(200).json({ success: true, data: { id: req.user.id, email: req.user.email } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/auth/add-member — ORG_ADMIN only
const addMember = async (req, res) => {
    try {
        // Only ORG_ADMIN can add members
        if (req.user.role !== "ORG_ADMIN") {
            return res.status(403).json({ success: false, message: "Only Org Admins can add members" });
        }

        const result = await authService.addMember({
            orgId: req.user.organizationId,
            addedById: req.user.id,
            name: req.body.name,
            email: req.body.email,
            role: req.body.role,
            jobTitle: req.body.jobTitle,
            departmentId: req.body.departmentId,
        });

        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export { register, login, getProfile, addMember };