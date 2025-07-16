import { Router } from "express";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { registerCliente, login, getClientesByAdmin, updateCliente, aprobarCliente, solicitarRecuperacion, resetPassword, updateClienteAdmin
    , updateClienteSolicitud, getMyAccount, getDatosPendientes, getClientesByAdminNumber
 } from "./auth.controller.js";

const router = Router()

router.post("/register", registerCliente)
router.post("/login", login)
router.put("/:id/aprobar", validarJWT, aprobarCliente);
router.put("/clientes", validarJWT, updateCliente);
router.put("/admin/:id", validarJWT, updateClienteAdmin);
router.put("/clientes/solicitud", validarJWT, updateClienteSolicitud);
router.get("/myAccount", validarJWT, getMyAccount);
router.get("/clientes/datos", validarJWT, getDatosPendientes);
router.get("/clientes", validarJWT, getClientesByAdmin);
router.get("/clientes/numero", validarJWT, getClientesByAdminNumber);
router.post("/recuperacion", solicitarRecuperacion);
router.post("/reset/", resetPassword);

export default router;