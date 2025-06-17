import { Router } from "express";
import { crearCuenta, obtenerCuentasPorUsuario, obtenerTodasCuentas, aprobarCuenta, deleteAccount} from "./account.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";

const router = Router();

router.post("/", validarJWT, crearCuenta);
router.get("/", validarJWT, obtenerCuentasPorUsuario);
router.get("/todas", validarJWT, obtenerTodasCuentas);
router.put("/:numeroCuenta/aprobar", validarJWT, aprobarCuenta);
router.delete("/:id", validarJWT, deleteAccount);
export default router;