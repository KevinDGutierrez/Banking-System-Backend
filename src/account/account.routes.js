import { Router } from "express";
import { crearCuenta, obtenerCuentasPorUsuario, obtenerTodasCuentas, aprobarCuenta} from "./account.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";

const router = Router();

router.post("/", validarJWT, crearCuenta);
router.get("/", validarJWT, obtenerCuentasPorUsuario);
router.get("/todas", validarJWT, obtenerTodasCuentas);
router.put("/:numeroCuenta/aprobar", validarJWT, aprobarCuenta);


export default router;