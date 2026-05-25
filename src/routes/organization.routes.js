import { Router } from "express";
import organizationController from "../controllers/organization.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post("/create", organizationController.createOrganization);
router.get("/me", organizationController.getMyOrganization);
router.put("/update", organizationController.updateOrganization);

export default router; 