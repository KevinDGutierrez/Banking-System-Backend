import { Router } from "express";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { registerCliente, login, getClientesByAdmin, updateCliente, deleteCliente, aprobarCliente, establecerTipoCuenta, solicitarRecuperacion, resetPassword, updtateClienteAdmin } from "./auth.controller.js";

const router = Router()

router.post("/register", registerCliente)
router.post("/login", login)
router.put("/:id/aprobar", validarJWT, aprobarCliente);
router.put("/clientes", validarJWT, updateCliente);
router.put("/admin/:id", validarJWT, updtateClienteAdmin);
router.delete("/", validarJWT, deleteCliente);
router.get("/clientes", validarJWT, getClientesByAdmin);
router.put("/cuentas/:numeroCuenta/tipo/", validarJWT, establecerTipoCuenta);
router.post("/recuperacion", solicitarRecuperacion);
router.post("/reset/", resetPassword);

export default router;