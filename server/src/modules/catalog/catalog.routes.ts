import { Router } from "express";
import { listImportedCatalog } from "./catalog.controller.js";

const router = Router();

router.get("/imported-listings", listImportedCatalog);

export default router;