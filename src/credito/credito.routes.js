import { Router } from "express";
import { check } from "express-validator";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { aprobarCredito, deleteCredito, getCreditoById, getCreditos, solicitarCredito } from "./credito.controller.js";

const router = Router();

router.post(
    "/",
    validarJWT,
    validarCampos,
    solicitarCredito
);

router.get(
    "/",
    validarJWT,
    getCreditos
);

router.get(
    "/:id",
    [
        validarJWT,
        check('id', 'Invalid ID').not().isEmpty(),
        validarCampos
    ],
    getCreditoById
);

router.put(
    "/:id",
    [
        validarJWT,
        check('id', 'Invalid ID').not().isEmpty(),
        validarCampos
    ],
    aprobarCredito
);

router.delete(
    "/:id",
    [
        validarJWT,
        check('id', 'Invalid ID').not().isEmpty(),
        validarCampos
    ],
    deleteCredito
);

export default router;