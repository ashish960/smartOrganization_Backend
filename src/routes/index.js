import { Router } from "express";
import authRouter from "./auth.routes.js";
import organizationRouter from "./organization.routes.js";
import departmentRouter from "./department.routes.js";
import documentRouter from "./document.routes.js";  // ← ADD THIS

const router = Router();

router.use("/auth", authRouter);
router.use("/organization", organizationRouter);
router.use("/departments", departmentRouter);
router.use("/documents", documentRouter);  // ← ADD THIS

export default router;