const router = require("express").Router();
const Brevo = require("@brevo/client");

// GET para home

router.get("/", (req, res) => {
    res.render("index", { title: "Daut Tattoo - Inicio" });
});

// GET galeria

router.get("/galeria", (req, res) => {
    res.render("galeria", { title: "Daut Tattoo - Galería" });
});

// GET contacto

router.get("/contacto", (req, res) => {
    res.render("contacto", { title: "Daut Tattoo - Contacto" });
});

// GET errror
router.get("/error", (req, res) => {
    res.render("error", { title: "Daut Tattoo - Error" });
});

// POST contacto
router.post("/contacto", async (req, res) => {
    const{ name, email, message} = req.body;
    console.log("Datos recibidos: ", name, ", ", email, ", ", message);
    const fondo = "#1a1a1a";
    const tarjeta = "#252525";
    const texto = "#F0F0F0";
    const textoSecundario = "#a0a0a0";
    const acento = "#c0392b";

    const htmlEmail = `
    <body style="margin: 0; padding: 0; background-color: ${fondo}; font-family: 'Roboto', sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td align="center" style="padding: 20px 0;">
                    
                    <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: ${tarjeta}; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);">
                        
                        <tr>
                            <td style="background-color: ${acento}; padding: 25px 30px;">
                                <h1 style="color: ${texto}; margin: 0; font-family: 'Playfair Display', serif; font-size: 24px; letter-spacing: 1px;">
                                    DAUT TATTOO
                                </h1>
                            </td>
                        </tr>
                        
                        <tr>
                            <td style="padding: 40px 30px; color: ${texto};">
                                <h2 style="margin: 0 0 20px 0; color: ${texto}; font-family: 'Playfair Display', serif; font-weight: 700;">
                                    ¡Nuevo contacto de ${name}!
                                </h2>
                                
                                <p style="margin: 0 0 15px 0; color: ${textoSecundario}; font-size: 16px; line-height: 1.6;">
                                    Has recibido un nuevo mensaje desde el formulario de Daut Tattoo:
                                </p>
                                
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${fondo}; padding: 20px; border-radius: 4px;">
                                    <tr>
                                        <td>
                                            <p style="margin: 0 0 10px 0; color: ${texto}; font-size: 16px;">
                                                <strong>Nombre:</strong> ${name}
                                            </p>
                                            <p style="margin: 0 0 10px 0; color: ${texto}; font-size: 16px;">
                                                <strong>Email (para responder):</strong> 
                                                <a href="mailto:${email}" style="color: ${acento}; text-decoration: none; font-weight: 700;">${email}</a>
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                                
                                <div style="margin-top: 25px;">
                                    <p style="margin: 0 0 10px 0; color: ${textoSecundario}; font-size: 16px;">
                                        <strong>Mensaje del cliente:</strong>
                                    </p>
                                    <p style="margin: 0; color: ${texto}; font-size: 16px; line-height: 1.7; white-space: pre-wrap; border-left: 2px solid ${acento}; padding-left: 15px; font-style: italic;">${message.trim()}</p>
                                </div>
                            </td>
                        </tr>
                        
                        <tr>
                            <td style="padding: 20px 30px; text-align: center; border-top: 1px solid ${fondo};">
                                <p style="color: ${textoSecundario}; font-size: 12px; margin: 0;">
                                    &copy; 2025 Daut Tattoo. Enviado desde el formulario web.
                                </p>
                            </td>
                        </tr>
                    </table>

                </td>
            </tr>
        </table>
    </body>
    `;

    const transacEmailApi = new Brevo.TransactionalEmailsApi();

    const sender = {
        email: process.env.EMAIL_TO,
        name: "Web Daut Tattoo"
    };

    const receivers = [
        { email: process.env.EMAIL_TO },
    ];

    try {
        await transacEmailApi.sendTransacEmail({
            sender: sender,
            to: receivers,
            replyTo: { email: email, name: name },
            subject: `Nuevo mensaje de ${name} desde la web`,
            htmlContent: htmlEmail,
        });

        console.log("Email enviado con éxito a Daut (vía API)");
        res.redirect("/gracias");
        
    } catch (error) {
        console.error("¡ERROR al enviar el email (API)!:", error.message || error);
        res.redirect("/error");
    }
});

// GET gracias
router.get("/gracias", (req, res) => {
    res.render("gracias", { title: "Daut Tattoo - Gracias" });
});

module.exports = router;