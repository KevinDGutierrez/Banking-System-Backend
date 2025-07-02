import { Router } from "express";
import { getServicios } from "./services.controller.js";

const router = Router()


router.get("/list-services", getServicios)


export default router;