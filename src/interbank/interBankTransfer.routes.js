import { Router } from "express";
import { check } from "express-validator";

import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import {
  realizarTransferenciaInterbancaria,
  getInterbankTransfers,
  getInterbankTransferById
} from "./interBankTransfer.controller.js";

const router = Router();

router.post(
  "/transferenciasInterbancaria",
  [
    validarJWT,
    validarCampos
  ],
  realizarTransferenciaInterbancaria
);

router.get(
  "/",
  validarJWT,
  getInterbankTransfers
);

router.get(
  "/:id",
  [
    validarJWT,
    check("id", "El ID de la transferencia es obligatorio").not().isEmpty(),
    validarCampos
  ],
  getInterbankTransferById
);

export default router;
