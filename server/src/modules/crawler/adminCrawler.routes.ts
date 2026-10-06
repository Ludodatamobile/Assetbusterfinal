import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest.js";
import { AdminCrawlerController } from "./adminCrawler.controller.js";
import {
  createCrawlSourceSchema,
  updateCrawlSourceSchema,
  updateImportedListingStatusSchema,
} from "./adminCrawler.schema.js";

const router = Router();

router.get("/overview", AdminCrawlerController.overview);

router.get("/sources", AdminCrawlerController.sources);
router.post(
  "/sources",
  validateRequest(createCrawlSourceSchema),
  AdminCrawlerController.createSource,
);
router.patch(
  "/sources/:id",
  validateRequest(updateCrawlSourceSchema),
  AdminCrawlerController.updateSource,
);

router.get("/listings", AdminCrawlerController.listings);
router.patch(
  "/listings/:id/status",
  validateRequest(updateImportedListingStatusSchema),
  AdminCrawlerController.updateListingStatus,
);

export default router;