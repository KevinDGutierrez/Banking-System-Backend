import { Router } from "express";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { registerCliente, login, getClientesByAdmin, updateCliente, deleteCliente, aprobarCliente, establecerTipoCuenta, solicitarRecuperacion, resetPassword } from "./auth.controller.js";

const router = Router()

router.post("/register", registerCliente)
router.post("/login", login)
router.put("/:id/aprobar", validarJWT, aprobarCliente);
router.put("/", validarJWT, updateCliente);
router.delete("/", validarJWT, deleteCliente);
router.get("/clientes", validarJWT, getClientesByAdmin);
router.put("/cuentas/:numeroCuenta/tipo/", validarJWT, establecerTipoCuenta);
router.post("/recuperacion", solicitarRecuperacion);
router.post("/reset/", resetPassword);

export default router;