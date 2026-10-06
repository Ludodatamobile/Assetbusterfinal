import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { AdminCrawlerService } from "./adminCrawler.service.js";

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export class AdminCrawlerController {
  static overview = asyncHandler(async (_req: Request, res: Response) => {
    const data = await AdminCrawlerService.getOverview();
    return ApiResponse.success(res, data);
  });

  static sources = asyncHandler(async (_req: Request, res: Response) => {
    const data = await AdminCrawlerService.getSources();
    return ApiResponse.success(res, data);
  });

  static createSource = asyncHandler(async (req: Request, res: Response) => {
    const source = await AdminCrawlerService.createSource(req.admin!.id, req.body);

    return ApiResponse.created(res, source, "Crawl source created.");
  });

  static updateSource = asyncHandler(async (req: Request, res: Response) => {
    const sourceId = getParam(req.params.id);

    if (!sourceId) {
      throw ApiError.badRequest("Source ID is required.");
    }

    const source = await AdminCrawlerService.updateSource(
      req.admin!.id,
      sourceId,
      req.body,
    );

    return ApiResponse.success(res, source, "Crawl source updated.");
  });

  static listings = asyncHandler(async (req: Request, res: Response) => {
    const result = await AdminCrawlerService.getImportedListings(
      req.query as Record<string, string>,
    );

    return ApiResponse.success(
      res,
      result.data,
      "Imported listings retrieved.",
      200,
      result.pagination,
    );
  });

  static updateListingStatus = asyncHandler(
    async (req: Request, res: Response) => {
      const listingId = getParam(req.params.id);

      if (!listingId) {
        throw ApiError.badRequest("Listing ID is required.");
      }

      const listing = await AdminCrawlerService.updateImportedListingStatus(
        req.admin!.id,
        listingId,
        req.body,
      );

      return ApiResponse.success(
        res,
        listing,
        "Imported listing status updated.",
      );
    },
  );
}