import { Router } from "express";
import * as controller from "../controllers/auth.controller";
import { verifyAccessToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

router.post("/register-admin", controller.registerAdmin);
router.post("/register-bulk", verifyAccessToken, requireRole("admin"), controller.registerBulk);
router.post("/complete-registration", controller.completeRegistration);
router.post("/login", controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", verifyAccessToken, controller.logout);
router.get("/me", verifyAccessToken, controller.me);

export default router;
