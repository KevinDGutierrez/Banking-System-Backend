import authUserModel from "./authUser.model.js";
import { request, response } from "express";
import { hash, verify } from "argon2";
import { ingresosCuenta,validarCamposObligatorios, validarCamposEditables
    , validarPermisoPropietarioOAdmin,  validarAprobacionPorAdmin,
    validarCamposUnicos, validarActivacionCuentaStatus
 } from "../helpers/db-validator-auth.js";
import { generateJWT } from "../helpers/generate-jwt.js";
import { sendApprovalEmail } from "../utils/sendEmail.js";



export const createAdmin = async () => {
    try {
        const verifyUser = await authUserModel.findOne({username : "ADMINB".toLowerCase(), correo : "admin@.com".toLowerCase()});
        
        if (!verifyUser) {
            const encryptedPassword = await hash("ADMINB")
            const adminUser = new authUserModel({
                username : "ADMINB".toLowerCase(),
                correo : "admin@.com".toLowerCase(),
                password : encryptedPassword,
                role : "ADMIN",
                status : true, 
            })

            await adminUser.save()   

            console.log("ADMIN CREADO") 
        } else {
            console.log("ADMIN EXISTE, NO SE VOLVIO A CREAR")
        }
    } catch (error) {
        console.error ("Error al crear ADMIN", error)
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
        await  ingresosCuenta(data.ingresos)
        await validarCamposUnicos(data);

        const encryptedPassword = await hash(data.password);

        const generateAccountNumber = () => {
            return Math.floor(100000000 + Math.random() * 900000000).toString();
        };

         await authUserModel.create({
            name: data.name,
            username: data.username,
            NoCuenta: generateAccountNumber(),
            password: encryptedPassword,
            dpi: data.dpi,
            direccion: data.direccion,
            celular: data.celular,
            correo: data.correo,
            NameTrabajo: data.NameTrabajo,
            ingresos: data.ingresos,
            status: false
        });

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
        const id = req.params.id;
        const data = req.body;

        
        await validarPermisoPropietarioOAdmin(req, id);
        await validarCamposEditables(req.body, id);
     
        await  ingresosCuenta(data.ingresos)

        
        const { dpi, correo, username, NoCuenta, role, password, ...datosActualizables } = req.body;

        const cliente = await authUserModel.findByIdAndUpdate(
            id,
            datosActualizables,
            { new: true }
        );

        if (!cliente) {
            return res.status(404).json({
                success: false,
                msg: "Cliente no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            message: "Cliente actualizado",
            cliente
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            msg: error.message
        });
    }
};



export const deleteCliente = async (req, res) => {
    try {
        const id = req.params.id;
    await validarPermisoPropietarioOAdmin(req, id);

    const cliente = await authUserModel.findByIdAndUpdate(
        id,
        { status: false },
        { new: true }
    );

    if (!cliente) {
        return res.status(404).json({
            success: false,
            msg: "Cliente no encontrado",
        });
    }

    res.status(200).json({
        success: true,
        msg: "Cuenta desactivada correctamente",
        cliente,
    });
} catch (error) {
    res.status(error.status || 500).json({
        success: false,
        msg: error.message || "Error al desactivar cuenta",
    });
}
};



