import { Router } from "express";
import {
  authenticate,
  authenticateOptional,
} from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { FundingServiceController } from "./fundingService.controller.js";
import {
  createFundingServiceSchema,
  fundingServiceEnquirySchema,
  fundingServiceIdParamsSchema,
  fundingServiceSlugParamsSchema,
  listFundingServicesSchema,
  updateFundingServiceSchema,
} from "./fundingService.schema.js";

const router = Router();

router.get(
  "/",
  validateRequest(listFundingServicesSchema),
  FundingServiceController.list
);

router.get(
  "/:slug",
  authenticateOptional,
  validateRequest(fundingServiceSlugParamsSchema),
  FundingServiceController.getBySlug
);

router.post(
  "/",
  authenticate,
  validateRequest(createFundingServiceSchema),
  FundingServiceController.create
);

router.patch(
  "/:id",
  authenticate,
  validateRequest(updateFundingServiceSchema.merge(fundingServiceIdParamsSchema)),
  FundingServiceController.update
);

router.post(
  "/:id/submit",
  authenticate,
  validateRequest(fundingServiceIdParamsSchema),
  FundingServiceController.submit
);

router.post(
  "/:id/enquire",
  authenticate,
  validateRequest(fundingServiceEnquirySchema.merge(fundingServiceIdParamsSchema)),
  FundingServiceController.enquire
);

router.delete(
  "/:id",
  authenticate,
  validateRequest(fundingServiceIdParamsSchema),
  FundingServiceController.delete
);

export default router;