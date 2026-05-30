import { Router } from "express";
import {
  authenticate,
  authenticateOptional,
} from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { StartupController } from "./startup.controller.js";
import {
  createStartupSchema,
  listStartupsSchema,
  startupIdParamsSchema,
  startupSlugParamsSchema,
  updateStartupSchema,
} from "./startup.schema.js";

const router = Router();

router.get(
  "/",
  validateRequest(listStartupsSchema),
  StartupController.list,
);

router.get(
  "/:slug",
  authenticateOptional,
  validateRequest(startupSlugParamsSchema),
  StartupController.getBySlug,
);

router.post(
  "/",
  authenticate,
  validateRequest(createStartupSchema),
  StartupController.create,
);

router.patch(
  "/:id",
  authenticate,
  validateRequest(updateStartupSchema.merge(startupIdParamsSchema)),
  StartupController.update,
);

router.post(
  "/:id/submit",
  authenticate,
  validateRequest(startupIdParamsSchema),
  StartupController.submit,
);

router.delete(
  "/:id",
  authenticate,
  validateRequest(startupIdParamsSchema),
  StartupController.delete,
);

export default router;