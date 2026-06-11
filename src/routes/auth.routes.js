import { Router } from "express";
import { register, login, getProfile, addMember, forgotPassword, verifyOTPController, resetPasswordController, changePasswordController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTPController);
router.post("/reset-password", resetPasswordController);

// Protected routes
router.get("/profile", authenticate, getProfile);
router.post("/add-member", authenticate, addMember);
router.post("/change-password", authenticate, changePasswordController);

export default router;