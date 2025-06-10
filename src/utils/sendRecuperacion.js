import nodemailer from 'nodemailer';

export const sendResetEmail = async (to, name, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "bancoinnova86@gmail.com",
                pass: "jtrv junp cffz npvi"
            }
        });

        const mailOptions = {
            from: '"Banking System" <bancoinnova86@gmail.com>',
            to,
            subject: "Banking System - Recuperación de cuenta",
             html: `
                <h3>Hola ${name},</h3>
                <p>Has solicitado restablecer tu contraseña.</p>
                <p>Copia  el siguiente codigo para crear una nueva contraseña:</p>
                <p href="${text}" target="_blank">${text}</p>
                <p>Este codigo expirará en 10 minutos.</p>
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