import { z } from "zod";

export const dealIdParamsSchema = z.object({
  params: z.object({
    dealId: z.string().uuid("Invalid deal ID."),
  }),
});

export const getDealMessagesSchema = z.object({
  params: z.object({
    dealId: z.string().uuid("Invalid deal ID."),
  }),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const sendMessageSchema = z.object({
  params: z.object({
    dealId: z.string().uuid("Invalid deal ID."),
  }),
  body: z.object({
    content: z
      .string()
      .trim()
      .min(1, "Message content cannot be empty.")
      .max(5000, "Message too long. Maximum is 5000 characters."),
  }),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>["body"];