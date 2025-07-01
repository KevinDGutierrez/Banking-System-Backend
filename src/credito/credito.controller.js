import Credito from "./credito.model.js";
import User from "../auth/authUser.model.js";
import Cuenta from "../account/account.model.js";
import { request, response } from "express";
import { obtenerTipoCambio } from "../utils/apiDivisa.js";
import { cuentaActiva, existeCreditoById, montoAprovacion, montoSolicitud, plazoSolicitud, soloAdmin, soloClient, tipoMonedaPermitida, verificarAprovacion, verificarAprovacionDelete } from "../helpers/db-validator-creditos.js";
import { emailCreditoAprovado, emailCreditoNoAprovado } from "../utils/sendEmail.js";

export const solicitarCredito = async (req, res) => {
    try {
        const { montoSolicitado, plazo, moneda, cuentaId } = req.body;
        const userId = req.user._id;
        const user = await User.findById(userId);

        await soloClient(req);
        await montoSolicitud(montoSolicitado);
        await plazoSolicitud(plazo);
        await tipoMonedaPermitida(moneda);

        const cuenta = await Cuenta.findOne({
            _id: cuentaId,
            propietario: userId,
            estado: 'activa'
        }).populate('entidadBancaria');

        if (!cuenta || cuenta.entidadBancaria.name.toLowerCase() !== 'banco innova') {
            return res.status(400).json({
                success: false,
                msg: "La cuenta bancaria no existe o no está activa para este usuario"
            })
        }

        const credito = await Credito.create({
            montoSolicitado,
            plazo,
            moneda: moneda || 'GTQ',
            user: user._id,
            cuenta: cuenta._id,
            username: user.username,
            activo: true
        })

        await credito.save();

        res.status(200).json({
            success: true,
            msg: "Credito solicitado exitosamente!!",
            credito
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Error al solicitar el credito",
            error: error.message
        })
    }
}

export const getCreditos = async (req = request, res = response) => {
    try {

        const { limite = 10, desde = 0 } = req.query;
        const userId = req.user._id;
        const esAdmin = req.user.role === 'ADMIN';
        const esClient = req.user.role === 'CLIENTE';

        let queryClient = { activo: false };
        if (esClient) {
            queryClient.status = false;
        } else {
            queryClient.user = userId;
        }

        let query = { activo: true };
        if (esAdmin) {
            query.status = false;
        } else {
            query.user = userId;
        }

        const finalQuery = { ...query, ...queryClient };

        const [total, creditos] = await Promise.all([
            Credito.countDocuments(finalQuery),
            Credito.find(finalQuery)
                .populate('user', 'username')
                .populate('cuenta', 'numeroCuenta tipoCuenta moneda')
                .skip(Number(desde))
                .limit(Number(limite))
                .sort({ createdAt: -1 })
        ])

        res.status(200).json({
            success: true,
            total,
            msg: "Creditos obtenidos exitosamente!!",
            creditos
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Error al obtener creditos",
            error: error.message
        })
    }
}

export const getCreditoById = async (req, res) => {
    try {

        const { id } = req.params;

        await existeCreditoById(id);

        const credito = await Credito.findById(id)
            .populate('user', 'username')
            .populate('cuenta', 'numeroCuenta tipoCuenta moneda');

        res.status(200).json({
            success: true,
            msg: "Credito obtenido exitosamente!!",
            credito
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Error al obtener credito",
            error: error.message
        })
    }
}

export const aprobarCredito = async (req, res = response) => {
    try {

        const { id } = req.params;
        const { montoAprobado } = req.body;

        await existeCreditoById(id);
        await soloAdmin(req);

        const credito = await Credito.findById(id);
        await verificarAprovacion(credito);
        await montoAprovacion(montoAprobado, credito);
        await credito.aprobarCredito(montoAprobado);

        const cuenta = await Cuenta.findById(credito.cuenta);
        await cuentaActiva(cuenta);

        if (credito.moneda !== cuenta.moneda) {
            const tipoCambio = await obtenerTipoCambio(credito.moneda, cuenta.moneda);
            const montoConvertido = montoAprobado * tipoCambio;

            cuenta.saldo += montoConvertido;
        } else {
            cuenta.saldo += montoAprobado;
        }

        await cuenta.save();

        const user = await User.findById(credito.user);
        await emailCreditoAprovado(user.correo, user.name, montoAprobado, credito.moneda);

        res.status(200).json({
            success: true,
            msg: "Credito aprobado exitosamente!!",
            credito
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Error al aprobar el credito del cliente",
            error: error.message
        })
    }
}

export const deleteCredito = async (req, res = response) => {
    try {

        const { id } = req.params;

        await soloAdmin(req);

        const credito = await Credito.findById(id);
        await verificarAprovacionDelete(credito);

        const creditoEliminado = await Credito.findByIdAndUpdate(id, { activo: false }, { new: true });

        const user = await User.findById(credito.user);
        await emailCreditoNoAprovado(user.correo, user.name, credito.moneda);

        res.status(200).json({
            success: true,
            msg: "Credito eliminado exitosamente!!",
            credito: creditoEliminado
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Error al eliminar crédito",
            error: error.message
        })
    }
}