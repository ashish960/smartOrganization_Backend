import { Router } from "express";
import departmentController from "../controllers/department.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get("/templates", departmentController.getTemplates);
router.post("/create-from-template", departmentController.createFromTemplate);
router.post("/create-custom", departmentController.createCustomDepartment);
router.get("/", departmentController.getDepartments);
router.put("/:id", departmentController.updateDepartment);
router.post("/:id/add-member", departmentController.addMember);
router.put("/:id/access-matrix", departmentController.updateAccessMatrix);
router.delete("/:id/remove-member/:userId", departmentController.removeMember);

export default router;