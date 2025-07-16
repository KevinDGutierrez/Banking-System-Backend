import { Router } from "express";
import { check } from "express-validator";

import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import {
  realizarTransferencia,
  getTransfers,
  getTransferById,
  getNumeroTotalTransferencias,
  getUltimaTransferencia,
} from "./transfer.controller.js";

const router = Router();

router.post(
  "/transferencias/:bancoReceptor",
  [
    validarJWT,
    validarCampos
  ],
  realizarTransferencia
);

router.get(
  "/",
  getTransfers
);

router.get(
  "/numero",
  validarJWT,
  getNumeroTotalTransferencias
);

router.get(
  "/ultima",
  validarJWT,
  getUltimaTransferencia
);

router.get(
  "/:id",
  [
    validarJWT,
    check("id", "El ID de la transferencia es obligatorio").not().isEmpty(),
    validarCampos
  ],
  getTransferById
);

export default router;
