import crypto from "crypto";
import User from "../models/User.js";
import { sendOTPEmail } from "./email.service.js";

// Generate 6 digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP for password reset
export const sendPasswordResetOTP = async (email) => {
    // 1. Check if user exists
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
        throw new Error("No account found with this email address");
    }

    // 2. Generate OTP
    const otp = generateOTP();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 3. Save OTP hash to user
    await User.findByIdAndUpdate(user._id, {
        passwordResetOTP: otpHash,
        passwordResetOTPExpiry: expiry,
    });

    // 4. Send email
    await sendOTPEmail(email, otp, user.name);

    return { message: "OTP sent successfully", email: user.email };
};

// Verify OTP
export const verifyOTP = async (email, otp) => {
    const user = await User.findOne({ email, isActive: true });
    if (!user) throw new Error("Invalid request");

    if (!user.passwordResetOTP || !user.passwordResetOTPExpiry) {
        throw new Error("No OTP requested. Please request a new one");
    }

    if (new Date() > user.passwordResetOTPExpiry) {
        throw new Error("OTP has expired. Please request a new one");
    }

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    if (otpHash !== user.passwordResetOTP) {
        throw new Error("Invalid OTP. Please try again");
    }

    // Generate a reset token valid for 15 minutes
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    await User.findByIdAndUpdate(user._id, {
        passwordResetOTP: null,
        passwordResetOTPExpiry: null,
        passwordResetToken: resetTokenHash,
        passwordResetTokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
    });

    return { resetToken, message: "OTP verified successfully" };
};

// Reset password using token
export const resetPassword = async (resetToken, newPassword) => {
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    const user = await User.findOne({
        passwordResetToken: tokenHash,
        passwordResetTokenExpiry: { $gt: new Date() },
        isActive: true,
    });

    if (!user) throw new Error("Invalid or expired reset token");

    // Update password — pre-save hook will hash it
    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetTokenExpiry = null;
    await user.save();

    return { message: "Password reset successfully" };
};

// Change password (logged in user)
export const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId).select("+password");
    if (!user) throw new Error("User not found");

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) throw new Error("Current password is incorrect");

    user.password = newPassword;
    await user.save();

    return { message: "Password changed successfully" };
};