import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getImportedCatalog } from "./catalog.service.js";

export const listImportedCatalog = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getImportedCatalog(req.query as Record<string, string>);

    return ApiResponse.success(
      res,
      result.data,
      "Imported listings retrieved.",
      200,
      result.pagination,
    );
  },
);