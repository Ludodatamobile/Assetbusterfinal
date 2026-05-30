import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { FundraiserService } from "./fundraiser.service.js";

function userIdFrom(req: Request) {
  return req.user?.id;
}

export const FundraiserController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await FundraiserService.list(req.query);
    return ApiResponse.success(
      res,
      result.data,
      "Fund raisers fetched successfully.",
      200,
      result.meta
    );
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const fundraiser = await FundraiserService.getBySlug(req.params.slug);
    return ApiResponse.success(
      res,
      fundraiser,
      "Fund raiser fetched successfully."
    );
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const fundraiser = await FundraiserService.create(userIdFrom(req)!, req.body);
    return ApiResponse.created(
      res,
      fundraiser,
      "Fund raiser profile created successfully."
    );
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const fundraiser = await FundraiserService.update(
      userIdFrom(req)!,
      req.params.id,
      req.body
    );

    return ApiResponse.success(
      res,
      fundraiser,
      "Fund raiser profile updated successfully."
    );
  }),

  submit: asyncHandler(async (req: Request, res: Response) => {
    const fundraiser = await FundraiserService.submit(userIdFrom(req)!, req.params.id);
    return ApiResponse.success(
      res,
      fundraiser,
      "Fund raiser submitted for review."
    );
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const data = await FundraiserService.delete(userIdFrom(req)!, req.params.id);
    return ApiResponse.success(res, data, "Fund raiser deleted successfully.");
  }),
};