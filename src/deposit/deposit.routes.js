import { Router } from "express";
import { 
    postDeposit,
    getDepositById,
    getDeposits,
    putDeposit,
    deleteDeposit } from "./deposit.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";

const router= Router();

router.post("/", validarJWT, postDeposit);
router.get("/:id",validarJWT, getDepositById);
router.get("/",validarJWT, getDeposits);
router.put("/:id",validarJWT, putDeposit);
router.delete("/:id",validarJWT, deleteDeposit);

export default router;