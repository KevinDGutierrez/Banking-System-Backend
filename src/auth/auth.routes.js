import { Router } from "express";
import { validarJWT } from "../middlewares/validar-jwt";
import { registerCliente, login, getClientesByAdmin, updateCliente, deleteCliente } from "./auth.controller";


const router = Router()


router.post("/register", registerCliente)
router.post("/login", login)
router.put("/:id", validarJWT, updateCliente);
router.delete("/:id", validarJWT, deleteCliente);
router.get("/clientes", validarJWT, getClientesByAdmin);


export default router;