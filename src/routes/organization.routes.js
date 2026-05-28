import express from "express";
import organizationController from "../controllers/organization.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.post("/create", organizationController.createOrganization);
router.get("/me", organizationController.getMyOrganization);
router.put("/update", organizationController.updateOrganization);

export default router;