import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(2, "First name must be at least 2 characters"),
    lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),

    email: z.string().trim().email("Invalid email address").toLowerCase(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase and number",
      ),

    role: z.enum([
      "BUSINESS_OWNER",
      "INVESTOR",
      "FRANCHISE_PARTNER",
      "ADVISOR",
    ]),

    phone: z.string().trim().min(7, "Phone number is too short").optional(),
    country: z.string().trim().min(2, "Country is required").optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email address").toLowerCase(),
    password: z.string().min(1, "Password is required"),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Verification token is required"),
  }),
});

export const resendVerificationEmailSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email address").toLowerCase(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email address").toLowerCase(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Reset token is required"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase and number",
      ),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required").optional(),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>["body"];
export type ResendVerificationEmailInput = z.infer<
  typeof resendVerificationEmailSchema
>["body"];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>["body"];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>["body"];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>["body"];
