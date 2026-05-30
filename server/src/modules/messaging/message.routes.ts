import { Router } from "express";
import * as controller from "./message.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  dealIdParamsSchema,
  getDealMessagesSchema,
  sendMessageSchema,
} from "./message.schema.js";

const router = Router();

router.use(authenticate);

router.get("/conversations", controller.getConversations);
router.get("/unread-count", controller.getUnreadCount);
router.get("/deals/:dealId", validateRequest(getDealMessagesSchema), controller.getDealMessages);
router.post("/deals/:dealId", validateRequest(sendMessageSchema), controller.sendMessage);
router.patch("/deals/:dealId/read", validateRequest(dealIdParamsSchema), controller.markRead);

export default router;