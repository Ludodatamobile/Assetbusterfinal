import { Router } from "express";
import {
  authenticate,
  authenticateOptional,
} from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { FundraiserController } from "./fundraiser.controller.js";
import {
  createFundraiserSchema,
  fundraiserIdParamsSchema,
  fundraiserSlugParamsSchema,
  listFundraisersSchema,
  updateFundraiserSchema,
} from "./fundraiser.schema.js";

const router = Router();

router.get(
  "/",
  validateRequest(listFundraisersSchema),
  FundraiserController.list
);

router.get(
  "/:slug",
  authenticateOptional,
  validateRequest(fundraiserSlugParamsSchema),
  FundraiserController.getBySlug
);

router.post(
  "/",
  authenticate,
  validateRequest(createFundraiserSchema),
  FundraiserController.create
);

router.patch(
  "/:id",
  authenticate,
  validateRequest(updateFundraiserSchema.merge(fundraiserIdParamsSchema)),
  FundraiserController.update
);

router.post(
  "/:id/submit",
  authenticate,
  validateRequest(fundraiserIdParamsSchema),
  FundraiserController.submit
);

router.delete(
  "/:id",
  authenticate,
  validateRequest(fundraiserIdParamsSchema),
  FundraiserController.delete
);

export default router;