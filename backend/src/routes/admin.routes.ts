import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate, authorize("SUPER_ADMIN"));

router.get("/dashboard", adminController.getDashboardStats);
router.get("/analytics", adminController.getPlatformAnalytics);

router.get("/cas", adminController.listAllCAs);
router.put("/cas/:id/approve", adminController.approveCA);
router.put("/cas/:id/reject", adminController.rejectCA);
router.put("/cas/:id/suspend", adminController.suspendCA);

router.get("/users", adminController.listAllUsers);
router.put("/users/:id/toggle", adminController.toggleUserStatus);

router.get("/settings", adminController.getPlatformSettings);
router.put("/settings", adminController.updatePlatformSettings);

export default router;
