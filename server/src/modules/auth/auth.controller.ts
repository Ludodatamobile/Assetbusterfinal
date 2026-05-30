import type { Request, Response, CookieOptions } from "express";
import { AuthService } from "./auth.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

const clearRefreshCookieOptions: CookieOptions = {
  ...refreshCookieOptions,
  maxAge: undefined,
};

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);

    return ApiResponse.created(
      res,
      { user: result.user },
      result.message,
    );
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);

    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);

    return ApiResponse.success(
      res,
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      "Login successful",
    );
  });

  static verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.verifyEmail(req.body);

    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);

    return ApiResponse.success(
      res,
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      result.message,
    );
  });

  static resendVerificationEmail = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await AuthService.resendVerificationEmail(req.body);

      return ApiResponse.success(res, null, result.message);
    },
  );

  static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.forgotPassword(req.body);
    return ApiResponse.success(res, null, result.message);
  });

  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.resetPassword(req.body);
    return ApiResponse.success(res, null, result.message);
  });

  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return ApiResponse.error(res, "Refresh token is required", 401);
    }

    const result = await AuthService.refreshAccessToken({ refreshToken });

    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);

    return ApiResponse.success(
      res,
      { accessToken: result.accessToken },
      "Token refreshed successfully",
    );
  });

 static logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  await AuthService.logout(refreshToken);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  return ApiResponse.success(res, null, "Logged out successfully");
});

  static getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await AuthService.getCurrentUser(req.user!.id);
    return ApiResponse.success(res, user);
  });
}
