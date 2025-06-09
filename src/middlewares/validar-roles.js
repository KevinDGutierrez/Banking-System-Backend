export const tieneRole = (...roles) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(500).json({
                success: false,
                msg: 'Tu quieres verificar el rol sin validar el token primero!'
            })
        }

        if (!roles.includes(req.user.role)) {
            return res.status(401).json({
                success: false,
                msg: `Usuario no autorizado, tiene el rol ${req.user.role}, los roles autorizados son: ${roles}!`
            })
        }

        next();
    }
}