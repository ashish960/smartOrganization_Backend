import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import userController from "../controllers/user.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);

export default router;