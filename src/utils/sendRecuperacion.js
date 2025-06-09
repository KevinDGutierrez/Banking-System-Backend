import nodemailer from 'nodemailer';

export const sendResetEmail = async (to, name, link) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "pablocastillo4821@gmail.com",
                pass: "jytu uiqm fvlc qkdu"
            }
        });

        const mailOptions = {
            from: '"Banking System" <pablocastillo4821@gmail.com>',
            to,
            subject: "Banking System - Recuperación de cuenta",
             html: `
                <h3>Hola ${name},</h3>
                <p>Has solicitado restablecer tu contraseña.</p>
                <p>Copia  el siguiente codigo para crear una nueva contraseña:</p>
                <a href="${link}" target="_blank">${link}</a>
                <p>Este enlace expirará en 15 minutos.</p>
            `
        };

        console.log(`Enviando correo a ${to}`);
        await transporter.sendMail(mailOptions);
        console.log("Correo enviado exitosamente");

    } catch (error) {
        console.error("Error al enviar el correo:", error.message);
        throw new Error("No se pudo enviar el correo de recuperación");
    }
};