import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { authenticate } from "../../middleware/authenticate.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationEmailSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.schema.js";

const router = Router();

router.post("/register", validateRequest(registerSchema), AuthController.register);
router.post("/login", validateRequest(loginSchema), AuthController.login);

router.post(
  "/verify-email",
  validateRequest(verifyEmailSchema),
  AuthController.verifyEmail,
);

router.post(
  "/resend-verification",
  validateRequest(resendVerificationEmailSchema),
  AuthController.resendVerificationEmail,
);

router.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  AuthController.forgotPassword,
);

router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  AuthController.resetPassword,
);

router.post("/refresh-token", AuthController.refreshToken);

router.post("/logout", AuthController.logout);
router.get("/me", authenticate, AuthController.getCurrentUser);

export default router;
