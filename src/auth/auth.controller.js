import authUserModel from "./authUser.model.js";
import { request, response } from "express";
import { hash, verify } from "argon2";
import {
    ingresosCuenta, validarCamposObligatorios, validarCamposEditables
    , validarPermisoPropietarioOAdmin, validarAprobacionPorAdmin,
    validarActivacionCuentaStatus, codigoVencido, validarContraseñaActual, NoRepetirContraseña, Dpidigities, Celulardigits, validarNoEditarADMIN
} from "../helpers/db-validator-auth.js";
import { generateJWT } from "../helpers/generate-jwt.js";
import { sendApprovalEmail, cambioDeDatos } from "../utils/sendEmail.js";
import accountModel from "../account/account.model.js";
import { validarTipoCuenta } from "../helpers/db-validator-cuenta.js";
import bankingModel from "../banking/banking.model.js";
import { sendResetEmail } from "../utils/sendRecuperacion.js";
import { generateResetToken } from "../helpers/generateResetToken.js";
import jwt from "jsonwebtoken";

export const createAdmin = async () => {
    try {
        const verifyUser = await authUserModel.findOne({ username: "ADMINB".toLowerCase(), correo: "admin@.com".toLowerCase() });

        if (!verifyUser) {
            const encryptedPassword = await hash("ADMINB")
            const adminUser = new authUserModel({
                username: "ADMINB".toLowerCase(),
                correo: "admin@.com".toLowerCase(),
                password: encryptedPassword,
                role: "ADMIN",
                status: true,
            })

            await adminUser.save()

            console.log("ADMIN CREADO")
        } else {
            console.log("ADMIN EXISTE, NO SE VOLVIO A CREAR")
        }
    } catch (error) {
        console.error("Error al crear ADMIN", error)
    }
}

export const login = async (req, res) => {
    const { correo, username, password } = req.body;

    try {
        const lowerCorreo = correo ? correo.toLowerCase() : null;
        const lowerUsername = username ? username.toLowerCase() : null;

        const user = await authUserModel.findOne({
            $or: [
                { correo: lowerCorreo },
                { username: lowerUsername }
            ],

        });

        if (!user) {
            console.log(user)
            return res.status(404).json({
                success: false,
                msg: "Usuario no encontrado"
            });
        }

        await validarActivacionCuentaStatus(user);

        const validPassword = await verify(user.password, password);
        if (!validPassword) {
            return res.status(400).json({
                success: false,
                msg: "Contraseña incorrecta"
            });
        }

        const token = await generateJWT(user._id);

        res.status(200).json({
            success: true,
            msg: "Sesión iniciada exitosamente",
            userDetails: {
                username: user.username,
                token: token,
                role: user.role,
                name: user.name,
                correo: user.correo,
                direccion: user.direccion,
                celular: user.celular,
                ingresos: user.ingresos,
                NameTrabajo: user.NameTrabajo,
                puntos: user.puntos,
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Error al iniciar sesión",
            error: error.message
        });
    }
};

export const registerCliente = async (req, res) => {
    try {
        const data = req.body;

        await validarCamposObligatorios(data);
        await ingresosCuenta(data.ingresos)
        await Dpidigities(data.dpi)
        await Celulardigits(data.celular)

        const encryptedPassword = await hash(data.password);

        const generateAccountNumber = () => {
            return Math.floor(Math.random() * (9999999999 - 1000000000 + 1000000000)).toString();;
        };

        const noCuentaGenerado = generateAccountNumber();
        const banco = await bankingModel.findOne({ name: "banco innova" });

        const nuevoCliente = await authUserModel.create({
            name: data.name.toLowerCase(),
            username: data.username.toLowerCase(),
            NoCuenta: noCuentaGenerado,
            password: encryptedPassword,
            dpi: data.dpi,
            direccion: data.direccion,
            celular: data.celular,
            correo: data.correo.toLowerCase(),
            NameTrabajo: data.NameTrabajo,
            ingresos: data.ingresos,
            puntos: 0,
            status: false
        });

        await accountModel.create({
            numeroCuenta: noCuentaGenerado,
            propietario: nuevoCliente._id,
            moneda: 'GTQ',
            entidadBancaria: banco._id,
            estado: 'bloqueada',
            tipo: data.tipo,
            saldo: 0
        })

        res.status(200).json({
            msg: "Cliente Registrado, espere a que un administrador apruebe su cuenta",

        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error en el registro de cliente",
            error: error.message
        });
    }
};

export const solicitarRecuperacion = async (req, res) => {
    try {
        const { correo } = req.body;

        const user = await authUserModel.findOne({ correo: correo.toLowerCase() });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "Usuario no encontrado"
            });
        }
        const generateSixDigitCode = () => Math.floor(100000 + Math.random() * 900000);
        const codigo = generateSixDigitCode();
        const codigoGeneradoCreatedAt = new Date();

        user.codigoGenerado = codigo.toString();
        user.codigoGeneradoCreatedAt = codigoGeneradoCreatedAt;
        await user.save();


        await sendResetEmail(user.correo, user.name, codigo);

        res.status(200).json({
            success: true,
            msg: "Correo de recuperación enviado exitosamente"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Error al enviar el correo de recuperación",
            error: error.message
        });
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { password, codigoGenerado } = req.body;

        console.log("Datos recibidos:", { password, codigoGenerado });
        const user = await codigoVencido(codigoGenerado)

        const validPassword = await hash(password);

        user.password = validPassword;
        user.codigoGenerado = null;
        user.codigoGeneradoCreatedAt = null;
        await user.save();

        res.status(200).json({
            success: true,
            msg: "Contraseña actualizada correctamente"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Error al actualizar la contraseña",
            error: error.message
        });
    }
}

export const aprobarCliente = async (req, res) => {
    try {
        const id = req.params.id;

        await validarAprobacionPorAdmin(req);

        const cliente = await authUserModel.findByIdAndUpdate(
            id,
            { status: true },
            { new: true }
        );

        if (!cliente) {
            return res.status(404).json({
                success: false,
                msg: "Cliente no encontrado"
            });
        }
        console.log("Correo del cliente:", cliente.correo);
        await sendApprovalEmail(cliente.correo, cliente.name);

        res.status(200).json({
            success: true,
            message: "Cliente aprobado",
            cliente
        });

    } catch (error) {
        console.log(error)
        return res.status(403).json({
            success: false,
            msg: error.message || "No tienes permisos"
        });
    }
};

export const getClientesByAdmin = async (req, res) => {
    const usuario = req.user;

    if (usuario.role !== "ADMIN") {
        return res.status(403).json({ message: "Solo los administradores pueden ver la lista de clientes" });
    }

    const clientes = await authUserModel.find({ role: "CLIENTE" });
    res.status(200).json(clientes);
};


export const updateCliente = async (req, res) => {
    try {
        const id = req.user._id;
        const data = req.body;
        await validarNoEditarADMIN(id);

        const { name, NoCuenta, dpi, direccion, celular, correo, NameTrabajo, role, ingresos, puntos, passwordActual, nuevaPassword, ...datosActualizables } = data;

        const cliente = await authUserModel.findById(id);

        if (!cliente) {
            return res.status(404).json({
                success: false,
                msg: "Cliente no encontrado"
            });
        }
        await validarContraseñaActual(cliente, passwordActual, nuevaPassword);
        await NoRepetirContraseña(datosActualizables, cliente, passwordActual, nuevaPassword);
        const clienteActualizado = await authUserModel.findByIdAndUpdate(
            id,
            datosActualizables,
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Cliente actualizado",
            cliente: clienteActualizado
        });

    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
            msg: error.message
        });
    }
};

export const updateClienteSolicitud = async (req, res) => {
    const id = req.user._id;
    const data = req.body;
    const { username, password, NoCuenta, dpi, ...datosActualizables } = data;
    const cliente = await authUserModel.findById(id);
    
    await validarNoEditarADMIN(id);
    if (!cliente) {
        throw new Error("Usuario no encontrado");
    }

    if ('ingresos' in data) {
        await ingresosCuenta(data.ingresos);
    }

    if ('celular' in data) {
        await Celulardigits(data.celular);
    }

    cliente.datosPendientes = datosActualizables;
    await cliente.save();

    res.status(200).json({
        success: true,
        message: "Espere la aprobacion de datos"
    });

}

export const getMyAccount = async (req, res) => {
    const id = req.user._id;
    const account = await authUserModel
    .findById(id)
    .select("name username direccion celular correo ingresos NameTrabajo")

    try {
        if (!account) {
            return res.status(404).json({
                success: false,
                msg: "Cuenta no encontrada"
            });
        }

        res.status(200).json({
            success: true,
            account
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Error al obtener la cuenta",
            error: error.message
        });
    }
}

export const updateClienteAdmin = async (req, res) => {
    try {
        const id = req.params.id;
        const { username, password, NoCuenta, dpi, ...datosActualizables } = req.body;
        await validarAprobacionPorAdmin(req);

        const cliente = await authUserModel.findById(id);

        if (!cliente || !cliente.datosPendientes) {
            throw new Error("No hay datos pendientes para actualizar");
        }

        const datosPendientes = cliente.datosPendientes;
        const datosAprobados = {};

        for (const campo in datosActualizables) {
            if (datosPendientes.hasOwnProperty(campo)) {
                datosAprobados[campo] = datosActualizables[campo];
            }
        }

        const clienteActualizado = await authUserModel.findByIdAndUpdate(
            id,
            {
                $set: datosAprobados,
                $unset: { datosPendientes: "" }
            },
            { new: true }
        );

        console.log("Correo del cliente:", cliente.correo);
        await cambioDeDatos(cliente.correo, cliente.name, datosAprobados);

        res.status(200).json({
            success: true,
            message: "Datos actualizados",
            cliente: clienteActualizado
        });

    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
            msg: error.message
        });
    }
};

export const getDatosPendientes = async (req, res) => {
    try{
        const cliente = await authUserModel.find({datosPendientes: {$exists : true, $ne: null}});


         const datosPendientes = cliente.map(cliente => ({
            id: cliente._id,
            usuario: cliente.username,
            datosPendientes: cliente.datosPendientes
        }));

        res.status(200).json({
            success: true,
            message: "Datos pendientes obtenidos",
            datosPendientes
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Error al obtener los datos pendientes",
            error: error.message
        });
    }
    
}