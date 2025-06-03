import authAdminModel from "../auth/authAdmin.model";





export const ingresosCuenta = async (ingresos, res) => {
    if (!data.ingresos || Number(ingresos) < 100) {
        return res.status(400).json({ message: "Los ingresos deben ser mayores o iguales a Q100" });
    }
}

export const validarCamposObligatorios = (data, res) => {
    const requiredFields = ["name", "username", "DPI", "direccion", "celular", "correo", "password", "NameTrabajo", "ingresos"];

    for (const field of requiredFields) {
        if (!data[field]) {
            return res.status(400).json({ message: `Falta el campo obligatorio: ${field}` });
        }
    }
};


export const validarCamposEditables = (data, res) => {
    const noEditables = ["NoCuenta", "dpi", "role"];
    for (const field of noEditables) {
        if (data.hasOwnProperty(field)) {
            return res.status(400).json({ message: `No puedes editar el campo: ${field}` });
        }
    }
};


export const validarPermisoPropietarioOAdmin = (req, res, id) => {
    const usuarioLogueado = req.user;

    if (usuarioLogueado.role !== "ADMIN" && usuarioLogueado._id.toString() !== id) {
        return res.status(403).json({ message: "No tienes permisos para realizar esta acción" });
    }
};


export const validarExistenciaUsuario = async (id, res) => {
    const user = await authAdminModel.findById(id);
    if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
    }
};

