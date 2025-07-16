import { Router } from "express";
import { check } from "express-validator";
import { crearOrden, getOrdenesConProductos, getOrdenesConServicios, getVerMisOrdenes } from "./orden.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";

const router = Router();

router.post(
    "/postOrden",
    [
        validarJWT,
        tieneRole("CLIENTE"),
        check("moneda", "La moneda es obligatoria y debe ser GTQ, USD o EUR!")
            .isIn(["GTQ", "USD", "EUR"]),
        check("metodoPago", "El método de pago es obligatorio! (dinero o puntos)")
            .isIn(["dinero", "puntos"]),
        check("items", "Los items no pueden ir vacíos!").isArray({ min: 1 }),
        validarCampos
    ],
    crearOrden
)

router.get(
    "/getOrdenesProductos",
    [
        validarJWT,
        tieneRole("ADMIN", "CLIENTE")
    ],
    getOrdenesConProductos
)

router.get(
    "/getOrdenesServicios",
    [
        validarJWT,
        tieneRole("ADMIN", "CLIENTE")
    ],
    getOrdenesConServicios
)

router.get("/getMisOrdenes", validarJWT, getVerMisOrdenes);

export default router;