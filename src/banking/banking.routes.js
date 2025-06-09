import { Router } from "express";
import { getBancos } from "./banking.controller.js";

const router = Router();

router.get("/", getBancos);

export default router;