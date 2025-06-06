import { Router } from "express";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { agregarFavorito, obtenerFavoritosPorUsuario } from "./favoritos.controller.js";

const router = Router();

router.post("/", validarJWT, agregarFavorito);
router.get("/", validarJWT, obtenerFavoritosPorUsuario);

export default router;