import type { Request } from "express";
import { ApiError } from "./ApiError.js";

export function requiredParam(req: Request, name: string): string {
  const value = req.params[name];

  if (typeof value !== "string" || value.trim() === "") {
    throw ApiError.badRequest(`${name} is required.`);
  }

  return value;
}