import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { StartupService } from "./startup.service.js";

function userIdFrom(req: Request) {
  return req.user?.id;
}

export const StartupController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await StartupService.list(req.query);

    return ApiResponse.success(
      res,
      result.data,
      "Startups fetched successfully.",
      200,
      result.meta,
    );
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const startup = await StartupService.getBySlug(req.params.slug);

    return ApiResponse.success(
      res,
      startup,
      "Startup fetched successfully.",
    );
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const startup = await StartupService.create(userIdFrom(req)!, req.body);

    return ApiResponse.created(
      res,
      startup,
      "Startup profile created successfully.",
    );
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const startup = await StartupService.update(
      userIdFrom(req)!,
      req.params.id,
      req.body,
    );

    return ApiResponse.success(
      res,
      startup,
      "Startup profile updated successfully.",
    );
  }),

  submit: asyncHandler(async (req: Request, res: Response) => {
    const startup = await StartupService.submit(userIdFrom(req)!, req.params.id);

    return ApiResponse.success(
      res,
      startup,
      "Startup submitted for review.",
    );
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const data = await StartupService.delete(userIdFrom(req)!, req.params.id);

    return ApiResponse.success(
      res,
      data,
      "Startup deleted successfully.",
    );
  }),
};