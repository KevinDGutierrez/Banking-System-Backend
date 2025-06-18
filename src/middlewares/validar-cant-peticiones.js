import rateLimit from "express-rate-limit";

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 1000,
    message: {
        success: false,
        msg: "Demasiadas peticiones desde esta IP, por favor intente después de 5 minutos"
    }
})

export default limiter;