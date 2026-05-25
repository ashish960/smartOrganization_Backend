import { Router } from "express";
import authRouter from "./auth.routes.js";
import organizationRouter from "./organization.routes.js";
import departmentRouter from "./department.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/organization", organizationRouter);
router.use("/departments", departmentRouter);

export default router;