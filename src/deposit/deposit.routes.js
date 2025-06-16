import { Router } from "express";
import { 
    postDeposit,
    postDepositWithExchange,
    getDepositById,
    getDeposits,
    putDeposit,
    deleteDeposit } from "./deposit.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";

const router= Router();

router.post('/',[validarJWT,tieneRole('ADMIN')], postDeposit)
router.post('/exchange',[validarJWT,tieneRole('ADMIN')], postDepositWithExchange)
router.get("/",[validarJWT,tieneRole('ADMIN')], getDeposits);
router.get('/account/:cuentaId',[validarJWT,tieneRole('ADMIN')], getDepositsByAccount) 
router.get("/:id",[validarJWT,tieneRole('ADMIN')], getDepositById);
router.put("/:id",[validarJWT,tieneRole('ADMIN')], putDeposit);
router.delete("/:id",[validarJWT,tieneRole('ADMIN')], deleteDeposit);
router.get('/stats',[validarJWT,tieneRole('ADMIN')], getDepositStats)


export default router;