import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import * as messageService from "./message.service.js";

export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const conversations = await messageService.getConversations(req.user!.id);
  return ApiResponse.success(res, conversations, "Conversations retrieved.");
});

export const getDealMessages = asyncHandler(async (req: Request, res: Response) => {
  const result = await messageService.getDealMessages(
    req.params.dealId,
    req.user!.id,
    req.query.page as string,
    req.query.limit as string,
  );

  return ApiResponse.success(res, result.messages, "Messages retrieved.", 200, result.meta);
});

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await messageService.sendMessage(
    req.params.dealId,
    req.user!.id,
    req.body.content,
  );

  return ApiResponse.created(res, { message }, "Message sent.");
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  await messageService.markMessagesRead(req.params.dealId, req.user!.id);
  return ApiResponse.success(res, null, "Messages marked as read.");
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await messageService.getUnreadCount(req.user!.id);
  return ApiResponse.success(res, { unreadCount: count });
});