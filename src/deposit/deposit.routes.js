import { Router } from "express";
import { 
    postDeposit,
    getDepositById,
    getDepositsByAccount,
    getDeposits,
    putDeposit,
    deleteDeposit ,
    getDepositStats} from "./deposit.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";

const router= Router();

router.get("/",[validarJWT,tieneRole('ADMIN')], getDeposits);
router.get('/account/:cuentaId',[validarJWT,tieneRole('ADMIN')], getDepositsByAccount) 
router.get("/:id",[validarJWT,tieneRole('ADMIN')], getDepositById);
router.post('/',[validarJWT,tieneRole('ADMIN')], postDeposit)
router.put("/:id",[validarJWT,tieneRole('ADMIN')], putDeposit);
router.delete("/:id",[validarJWT,tieneRole('ADMIN')], deleteDeposit);
router.get('/stats/:id',[validarJWT,tieneRole('ADMIN')], getDepositStats)


export default router;