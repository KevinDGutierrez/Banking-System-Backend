import { Router } from "express";
import { check } from "express-validator";
import { postProducto, getProductos, getProductoPorId, getProductoPorNombre, putProducto, deleteProducto } from "./producto.controller.js";
import { idProductoValida, nombreProductoValido } from "../helpers/db-validator-productos.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";

const router = Router();

router.post(
    "/postProducto",
    [
        validarJWT,
        tieneRole("ADMIN"),
        validarCampos
    ],
    postProducto
)

router.get("/getProductos", getProductos);

router.get(
    "/getProductoPorId/:id",
    [
        check("id", "id invalid!").isMongoId(),
        check("id").custom(idProductoValida),
        validarCampos
    ],
    getProductoPorId
)

router.get(
    "/getProductoPorNombre/:nombre",
    [
        check("nombre").custom(nombreProductoValido),
        validarCampos
    ],
    getProductoPorNombre
)

router.put(
    "/putProducto/:id",
    [
        validarJWT,
        tieneRole("ADMIN"),
        check("id", "id invalid!").isMongoId(),
        check("id").custom(idProductoValida),
        validarCampos
    ],
    putProducto
)

router.delete(
    "/deleteProducto/:id",
    [
        validarJWT,
        tieneRole("ADMIN"),
        check("id", "id invalid!").isMongoId(),
        check("id").custom(idProductoValida),
        validarCampos
    ],
    deleteProducto
)

export default router;