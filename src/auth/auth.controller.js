import authAdminModel from "./authAdmin.model.js";
import { request, response } from "express";
import { hash, verify } from "argon2";
import { ingresosCuenta,validarCamposObligatorios, validarCamposEditables
    , validarPermisoPropietarioOAdmin, validarExistenciaUsuario
 } from "../helpers/db-validator-auth.js";
import { generateJWT } from "../helpers/generate-jwt.js";



export const createAdmin = async () => {
    try {
        const verifyUser = await authAdminModel.findOne({username : "ADMINB"})
        
        if (!verifyUser) {
            const encryptedPassword = await hash("ADMINB")
            const adminUser = new authAdminModel({
                username : "ADMINB".toLowerCase(),
                password : encryptedPassword,
                role : "ADMIN"
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
    const {correo, username} = req.body;

    try{
        const lowerCorreo = correo ? correo.toLowerCase() : null;
        const lowerUsername = username ? username.toLowerCase() : null;

        const user = await authAdminModel.findOne({
            $or : [
                {correo : lowerCorreo},
                {username : lowerUsername}
            ]
        })


        const token = await generateJWT(user.id)

        res.status(200).json({
            succes: true,
            msg : "Sesion iniciad exitosamente",
            userDetails : {
                username : user.username,
                token : token,
            }
        })
    } catch {
        return res.status(500).json({
            success: false,
            msg: "Error al iniciar sesión",
            error: error.message
        })
    }
}

export const registerCliente = async () => {
    try {
        const data = req.body;

        const encryptedPassword = await hash(data.password)
        const errorCampos = validarCamposObligatorios(data, res);
        if (errorCampos) return;
    
        const errorIngresos = validarIngresos(data.ingresos, res);
        if (errorIngresos) return;

        const generateAccountNumber = () => {
            return Math.floor(100000000 + Math.random() * 900000000).toString()
        }


        const cliente = await authAdminModel.create({
            name : data.name,
            username : data.username,
            NoCuenta : generateAccountNumber(),
            direccion : data.direccion,
            celular : data.celular,
            correo : data.correo,
            password : encryptedPassword(),
            NameTrabajo : data.NameTrabajo,
            status : false
        });

        res.status(200) ({
            msg : "Cliente Registrado",
            clienteUser : {
                cliente : cliente
            }
        })
    } catch (error) {
        console.log(error)

        return res.status(500).json({
            msg : "Registro de Cliente"
        })
    }
}



export const getClientesByAdmin = async (req, res) => {
    const usuario = req.user;

    if (usuario.role !== "ADMIN") {
        return res.status(403).json({ message: "Solo los administradores pueden ver la lista de clientes" });
    }

    const clientes = await authAdminModel.find({ role: "CLIENTE" });
    res.status(200).json(clientes);
};


export const updateCliente = async (req, res) => {
    const id = req.params.id;

    
    const errorPermisos = validarPermisoPropietarioOAdmin(req, res, id);
    if (errorPermisos) return;
    
    await validarExistenciaUsuario(id, res);
    
    const errorCampos = validarCamposEditables(req.body, res);
    if (errorCampos) return;

    const { NoCuenta, dpi, role, ...datosActualizables } = req.body;
    const cliente = await authAdminModel.findByIdAndUpdate(id, datosActualizables, { new: true });

    res.status(200).json({ message: "Cliente actualizado", cliente });
};


export const deleteCliente = async (req, res) => {
    const id = req.params.id;

    
    const errorPermisos = validarPermisoPropietarioOAdmin(req, res, id);
    if (errorPermisos) return;

    
    await validarExistenciaUsuario(id, res);

   
    const cliente = await authAdminModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Cliente eliminado", cliente });
};


