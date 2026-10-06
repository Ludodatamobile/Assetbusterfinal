import type { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";

export const validateRequest = (schema: z.ZodType) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((issue) => issue.message);

        return next(
          ApiError.badRequest(`Validation error: ${messages.join(", ")}`),
        );
      }

      next(error);
    }
  };
};