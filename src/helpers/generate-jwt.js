import jwt from "jsonwebtoken";

export const generateJWT = (uid = '', role = '') => {

    return new Promise((resolve, reject) => {

        const payload = { uid, role };

        jwt.sign(
            payload,
            process.env.SECRETORPRIVATEKEY,
            {
                expiresIn: '2h'
            },
            (err, token) => {
                err ? (console.log(err), reject("No se pudo generar el token")) : resolve(token);
            })
    })
}