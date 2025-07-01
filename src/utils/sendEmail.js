
import nodemailer from 'nodemailer';

export const sendApprovalEmail = async (to, nombreCliente) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "bancoinnova86@gmail.com",
                pass: "hmeb vaml fmto yxam"
            }
        });

        const mailOptions = {
            from: '"Banking System" <bancoinnova86@gmail.com>',
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
                user: "bancoinnova86@gmail.com",
                pass: "hmeb vaml fmto yxam"
            }
        })

        const mailOptions = {
            from: '"Banking System" <bancoinnova86@gmail.com>',
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

export const emailCreditoNoAprovado = async (to, nombreCliente, moneda) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "bancoinnova86@gmail.com",
                pass: "hmeb vaml fmto yxam"
            }
        })

        const mailOptions = {
            from: '"Banking System" <bancoinnova86@gmail.com>',
            to,
            subject: "Banking System - Aprobación de Crédito",
            text: `Hola ${nombreCliente},\n\nGracias por tu solicitud de crédito. Te informamos que el monto mínimo que puedes solicitar es de ${moneda}1,000. Además, si solicitas un crédito de esta cantidad, el plazo máximo disponible será de 12 meses.\n\nSi deseas solicitar una cantidad superior, podemos ofrecerte plazos más largos. \n\nNo dudes en ponerte en contacto con nosotros si tienes alguna pregunta o si deseas más información sobre los términos disponibles.\n\nAtentamente,\nBanking System`
        }

        console.log(`Enviando correo a ${to}`);
        await transporter.sendMail(mailOptions);
        console.log("Correo enviado exitosamente");

    } catch (error) {
        console.error("Error al enviar el correo:", error.message);
        throw new Error("No se pudo enviar el correo de no aprobación de crédito");
    }
}

export const cambioDeDatos = async (to, nombreCliente, datos) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "bancoinnova86@gmail.com",
                pass: "hmeb vaml fmto yxam"
            }
        })
        const cambios = Object.entries(datos)
            .map(([key, value]) => `- ${key}: ${value}`)
            .join('\n');
        const mailOptions = {
            from: '"Banking System" <bancoinnova86@gmail.com>',
            to,
            subject: "Banking System - Cambio de datos",
            text: `Hola ${nombreCliente}, \n\nLos datos que se han actualizado son los siguientes: \n\n ${cambios}`
        }

        console.log(`Enviando correo a ${to}`);
        await transporter.sendMail(mailOptions);
        console.log("Correo enviado exitosamente");

    } catch (error) {
        console.error("Error al enviar el correo:", error.message);
        throw new Error("No se pudo enviar el correo de cambio de datos");
    }
}