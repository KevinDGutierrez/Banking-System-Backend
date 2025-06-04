
import nodemailer from 'nodemailer';

export const sendApprovalEmail = async (to, nombreCliente) => {
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
            subject: "Banking System - Aprobación de cuenta",
            text: `Hola ${nombreCliente}, tu cuenta ha sido aprobada por el administrador del banco.`
        };

        console.log(`Enviando correo a ${to}`);
        await transporter.sendMail(mailOptions);
        console.log("Correo enviado exitosamente");

    } catch (error) {
        console.error("Error al enviar el correo:", error.message);
        throw new Error("No se pudo enviar el correo de aprobación");
    }
};
