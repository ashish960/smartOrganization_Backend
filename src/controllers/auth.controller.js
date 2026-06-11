import * as authService from "../services/auth.service.js";
import { sendPasswordResetOTP, verifyOTP, resetPassword, changePassword } from "../services/otp.service.js";

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

const addMember = async (req, res) => {
    try {
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

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email is required" });
        const result = await sendPasswordResetOTP(email);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// POST /api/auth/verify-otp
const verifyOTPController = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP are required" });
        const result = await verifyOTP(email, otp);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// POST /api/auth/reset-password
const resetPasswordController = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        if (!resetToken || !newPassword) return res.status(400).json({ success: false, message: "Reset token and new password are required" });
        if (newPassword.length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        const result = await resetPassword(resetToken, newPassword);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// POST /api/auth/change-password (requires auth)
const changePasswordController = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: "Both passwords are required" });
        if (newPassword.length < 8) return res.status(400).json({ success: false, message: "New password must be at least 8 characters" });
        const result = await changePassword(req.user.id, currentPassword, newPassword);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export { register, login, getProfile, addMember, forgotPassword, verifyOTPController, resetPasswordController, changePasswordController };