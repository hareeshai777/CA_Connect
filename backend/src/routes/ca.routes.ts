import { Router } from "express";
import { body, query } from "express-validator";
import * as caController from "../controllers/ca.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/", caController.listCAs);
router.get("/:id", caController.getCAProfile);
router.get("/:id/slots", caController.getCATimeSlots);

router.post(
  "/register",
  authenticate,
  authorize("CA_PROFESSIONAL"),
  [
    body("firstName").trim().notEmpty(),
    body("lastName").trim().notEmpty(),
    body("consultationFee").isInt({ min: 0 }),
    body("experienceYears").isInt({ min: 0 }),
  ],
  validate,
  caController.registerCA
);

router.put("/profile", authenticate, authorize("CA_PROFESSIONAL"), caController.updateCAProfile);
router.get("/my/profile", authenticate, authorize("CA_PROFESSIONAL"), caController.getMyCAProfile);
router.get("/my/dashboard", authenticate, authorize("CA_PROFESSIONAL"), caController.getCADashboardStats);

router.post(
  "/upload/documents",
  authenticate,
  authorize("CA_PROFESSIONAL"),
  upload.array("documents", 5),
  caController.uploadCADocuments
);

router.post(
  "/upload/avatar",
  authenticate,
  authorize("CA_PROFESSIONAL"),
  upload.single("avatar"),
  caController.uploadAvatar
);

router.post(
  "/slots",
  authenticate,
  authorize("CA_PROFESSIONAL"),
  [body("slots").isArray({ min: 1 })],
  validate,
  caController.manageTimeSlots
);

router.delete("/slots/:id", authenticate, authorize("CA_PROFESSIONAL"), caController.deleteTimeSlot);

export default router;
