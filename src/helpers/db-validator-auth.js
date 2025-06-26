import { hash, verify } from "argon2";
import authUserModel from "../auth/authUser.model.js";

export const ingresosCuenta = async (ingresos = '') => {
    if (!ingresos || Number(ingresos) < 100) {
        throw new Error("Los ingresos deben ser mayores o iguales a Q100");

    }
}

export const validarCamposObligatorios = async (data) => {
    const requiredFields = ["name", "username", "dpi", "direccion", "celular", "correo", "password", "NameTrabajo", "ingresos"];

    for (const field of requiredFields) {
        if (!data[field]) {
            throw new Error(`El campo ${field} es requerido`);

        }
    }

};


export const Dpidigities = async (dpi = '') => {
   if(!dpi || dpi.length !== 13) {
       throw new Error("Dpi debe tener 13 dígitos");
   }
};

export const Celulardigits = async (celular = '') => {
    if(!celular || celular.length !== 8) {
        throw new Error("Celular debe tener 8 dígitos");
    }
};



export const validarCamposEditables = async (data, idUsuarioActual) => {
    const { dpi, correo, username, NoCuenta } = data;

    

    if (correo) {
        const usuarioCorreo = await authUserModel.findOne({ correo });
        if (usuarioCorreo && usuarioCorreo._id.toString() !== idUsuarioActual) {
            throw new Error(`El correo ya está en uso`);
        }
    }

    if (username) {
        const usuarioUsername = await authUserModel.findOne({ username });
        if (usuarioUsername && usuarioUsername._id.toString() !== idUsuarioActual) {
            throw new Error(`El username ya está en uso`);
        }
    }

    if (NoCuenta) {
        const usuarioCuenta = await authUserModel.findOne({ NoCuenta });
        if (usuarioCuenta && usuarioCuenta._id.toString() !== idUsuarioActual) {
            throw new Error(`El número de cuenta ya está en uso`);
        }
    }


};

export const validarContraseñaActual = async (cliente, currentPassword, password) => {

    if (password) {
        if (!currentPassword) {
            throw new Error('Debes proporcionar la contraseña actual para cambiarla');
        }

        const passwordValid = await verify(cliente.password, currentPassword);

        if (!passwordValid) {
            throw new Error('Contraseña actual incorrecta');
        }


        cliente.password = await hash(password);
        await cliente.save();
    }
} 

export const NoRepetirContraseña = async (datosActualizables, cliente, passwordActual, nuevaPassword) => {
    if (passwordActual && nuevaPassword && passwordActual === nuevaPassword) {
        throw new Error("La contraseña actual es la misma que la nueva");
    }
}



export const validarPermisoPropietarioOAdmin = async (req) => {
     const usuario = req.user;

    if (usuario.role !== "ADMIN") {
        throw new Error("No tienes permisos para realizar esta acción");

    }
};

export const validarNoEditarADMIN = async (id) => {
    const user = await authUserModel.findById(id);

    if(user.username === "ADMINB" || user.role === "ADMIN") {
        throw new Error("No se puede actualizar el usuario ADMIN");
    }
};



export const validarAprobacionPorAdmin = async (req) => {
    const usuario = req.user;

    if (usuario.role !== "ADMIN") {
        throw new Error("No tienes permisos para aprobar clientes");

    }
};


export const validarActivacionCuentaStatus = async (user) => {
    if (!user) {
        throw new Error("Usuario no encontrado");
    }

    if (!user.status && user.role === "CLIENTE") {
        throw new Error("Tu cuenta aún no está activada. Espera la aprobación del administrador.");
    }
}

export const codigoVencido = async (codigoGenerado) => {
    const user = await authUserModel.findOne({ codigoGenerado });

    if (!user) {
        throw new Error("Código inválido");
    }
    const currentTime = new Date();
    const expirationTime = new Date(user.codigoGeneradoCreatedAt);

    expirationTime.setMinutes(expirationTime.getMinutes() + 10);

    if (currentTime > expirationTime) {
        throw new Error("El código de recuperación ha expirado. Por favor, solicita uno nuevo.");
    }

    return user;
};