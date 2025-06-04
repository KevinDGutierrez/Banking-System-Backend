import { Router } from "express";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { agregarFavorito } from "./favoritos.controller.js";

const router = Router();

router.post("/", validarJWT, agregarFavorito);

export default router;