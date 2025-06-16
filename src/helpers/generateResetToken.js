import jwt from "jsonwebtoken";

export const generateResetToken = (uid = '') => {
  return new Promise((resolve, reject) => {
    const payload = { uid, action: 'reset' };
    jwt.sign(
      payload,
      process.env.SECRETORPRIVATEKEY,
      {
        expiresIn: "15m",
      },
      (err, token) => {
        err
          ? (console.log(err), reject("No se pudo generar el token de recuperación"))
          : resolve(token);
      }
    );
  });
};