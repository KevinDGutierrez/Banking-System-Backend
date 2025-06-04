import { Router } from "express";
import { crearCuenta } from "./account.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";

const router = Router();

router.post("/", validarJWT, crearCuenta);

export default router;