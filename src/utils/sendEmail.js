
import nodemailer from 'nodemailer';

export const sendApprovalEmail = async (to, nombreCliente) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
<<<<<<< HEAD
                user: "bancoinnova86@gmail.com",
                pass: "jtrv junp cffz npvi"
=======
                user: "pablocastillo4821@gmail.com",
                pass: "jytu uiqm fvlc qkdu"
>>>>>>> b9062cc (transfers added)
            }
        });

        const mailOptions = {
<<<<<<< HEAD
            from: '"Banking System" <bancoinnova86@gmail.com>',
=======
            from: '"Banking System" <pablocastillo4821@gmail.com>',
>>>>>>> b9062cc (transfers added)
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

export const emailCreditoAprovado = async (to, nombreCliente, montoAprobado, moneda) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
<<<<<<< HEAD
                user: "bancoinnova86@gmail.com",
                pass: "jtrv junp cffz npvi"
=======
                user: "pablocastillo4821@gmail.com",
                pass: "jytu uiqm fvlc qkdu"
>>>>>>> b9062cc (transfers added)
            }
        })

        const mailOptions = {
<<<<<<< HEAD
            from: '"Banking System" <bancoinnova86@gmail.com>',
=======
            from: '"Banking System" <pablocastillo4821@gmail.com>',
>>>>>>> b9062cc (transfers added)
            to,
            subject: "Banking System - Aprobación de Crédito",
            text: `Hola ${nombreCliente},\n\nTu solicitud de crédito ha sido aprobada. El monto aprobado es de ${montoAprobado} ${moneda}.\n\n¡Gracias por confiar en nuestro sistema!`
        }

        console.log(`Enviando correo a ${to}`);
        await transporter.sendMail(mailOptions);
        console.log("Correo enviado exitosamente");

    } catch (error) {
        console.error("Error al enviar el correo:", error.message);
        throw new Error("No se pudo enviar el correo de aprobación de crédito");
    }
}