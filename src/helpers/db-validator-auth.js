import authUserModel from "../auth/authUser.model.js";

export const ingresosCuenta = async (ingresos = '') => {
    if (!ingresos || Number(ingresos) < 100) {
         throw new Error( "Los ingresos deben ser mayores o iguales a Q100" );
  
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

export const validarCamposUnicos = async (data) => {
    const { dpi, correo, username, celular } = data;

    
    const usuarioDpi = await authUserModel.findOne({ dpi });
    if (usuarioDpi) throw new Error(`Este dpi ya está registrado en nuestro banco`);

    const usuarioCorreo = await authUserModel.findOne({ correo });
    if (usuarioCorreo) throw new Error(`Este correo ya está registrado en nuestro banco`);

    const usuarioUsername = await authUserModel.findOne({ username });
    if (usuarioUsername) throw new Error(`Este username ya está registrado en nuestro banco`);

    const usuarioCelular = await authUserModel.findOne({ celular });
    if (usuarioCelular) throw new Error(`Este celular ya está registrado en nuestro banco`);
};

export const validarCamposEditables = async (data, idUsuarioActual) => {
    const { dpi, correo, username, NoCuenta, password } = data;

    if (dpi) {
        const usuarioDpi = await authUserModel.findOne({ dpi });
        if (usuarioDpi && usuarioDpi._id.toString() !== idUsuarioActual) {
            throw new Error(`El DPI ya está en uso`);
        }
    }

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


export const validarPermisoPropietarioOAdmin = async (req, id) => {
    const usuarioLogueado = req.user;

    if (usuarioLogueado.role !== "ADMIN" && usuarioLogueado._id.toString() !== id) {
        const error = new Error("No tienes permisos para realizar esta acción");
        error.status = 403;
        throw error;
    }
};







export const validarAprobacionPorAdmin  = async (req) => {
    const usuario = req.user;

    if (usuario.role !== "ADMIN") {
        throw new Error( "No tienes permisos para aprobar clientes" );
       
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
