import { Router } from "express";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { registerCliente, login, getClientesByAdmin, updateCliente, deleteCliente, aprobarCliente, establecerTipoCuenta } from "./auth.controller.js";

const router = Router()

router.post("/register", registerCliente)
router.post("/login", login)
router.put("/:id/aprobar", validarJWT, aprobarCliente);
router.put("/:id", validarJWT, updateCliente);
router.delete("/:id", validarJWT, deleteCliente);
router.get("/clientes", validarJWT, getClientesByAdmin);
router.put("/cuentas/:numeroCuenta/tipo/", validarJWT, establecerTipoCuenta);

export default router;