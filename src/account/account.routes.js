import { Router } from "express";
import { crearCuenta, obtenerCuentasPorUsuario, obtenerTodasCuentas, aprobarCuenta, deleteAccount, getOpciones, getNumeroCuentasActivas, getListarSaldoPorCuenta} from "./account.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";

const router = Router();

router.post("/", validarJWT, crearCuenta);
router.get("/usuario", validarJWT, obtenerCuentasPorUsuario);
router.get("/todas", validarJWT, obtenerTodasCuentas);
router.get("/numero", validarJWT, getNumeroCuentasActivas);
router.get("/saldo", validarJWT, getListarSaldoPorCuenta);
router.get("/opciones", getOpciones);
router.put("/:numeroCuenta/aprobar", validarJWT, aprobarCuenta);
router.delete("/:id", validarJWT, deleteAccount);
export default router;