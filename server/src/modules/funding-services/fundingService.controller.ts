import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { FundingServiceService } from "./fundingService.service.js";

function userIdFrom(req: Request) {
  return req.user?.id;
}

export const FundingServiceController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await FundingServiceService.list(req.query);
    return ApiResponse.success(
      res,
      result.data,
      "Funding services fetched successfully.",
      200,
      result.meta
    );
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const fundingService = await FundingServiceService.getBySlug(req.params.slug);
    return ApiResponse.success(
      res,
      fundingService,
      "Funding service fetched successfully."
    );
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const fundingService = await FundingServiceService.create(userIdFrom(req)!, req.body);
    return ApiResponse.created(
      res,
      fundingService,
      "Funding service profile created successfully."
    );
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const fundingService = await FundingServiceService.update(
      userIdFrom(req)!,
      req.params.id,
      req.body
    );

    return ApiResponse.success(
      res,
      fundingService,
      "Funding service profile updated successfully."
    );
  }),

  submit: asyncHandler(async (req: Request, res: Response) => {
    const fundingService = await FundingServiceService.submit(userIdFrom(req)!, req.params.id);
    return ApiResponse.success(
      res,
      fundingService,
      "Funding service submitted for review."
    );
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const data = await FundingServiceService.delete(userIdFrom(req)!, req.params.id);
    return ApiResponse.success(res, data, "Funding service deleted successfully.");
  }),

  enquire: asyncHandler(async (req: Request, res: Response) => {
    const deal = await FundingServiceService.enquire(
      userIdFrom(req)!,
      req.params.id,
      req.body.message
    );

    return ApiResponse.created(
      res,
      { deal },
      "Funding service enquiry sent successfully."
    );
  }),
};