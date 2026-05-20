import { Router } from "express";
import { body } from "express-validator";
import * as serviceController from "../controllers/service.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();

router.get("/", serviceController.getServices);
router.get("/:slug", serviceController.getServiceBySlug);

router.post(
  "/",
  authenticate,
  authorize("SUPER_ADMIN"),
  [
    body("name").trim().notEmpty(),
    body("slug").trim().notEmpty(),
    body("description").trim().notEmpty(),
    body("category").notEmpty(),
  ],
  validate,
  serviceController.createService
);

router.put("/:id", authenticate, authorize("SUPER_ADMIN"), serviceController.updateService);

export default router;
