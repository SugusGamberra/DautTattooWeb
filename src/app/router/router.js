/* definimos todas las rutas (URL) de la web y qué debe hacer el server según el user vaya toqueteando cada cosa
*/

// importo express como un router (solo se encarga de gestionar rutas) y el kit de herramientas de brevo (el servicio que uso para enviar emails)
const router = require("express").Router();
const SibApiV3Sdk = require('sib-api-v3-sdk');

// Uso metodos get para cuando el usuario clica en un enlace o escribe la ruta, y metodo post para el envio de datos en contacto

/* GET para home: Como en el resto, cuando un user clica un enlace o accede por url como dije con res.render  le digo
"busca en views (q la configure en index.js) un archivo que se llama index y muestralo"
y de paso le pongo el titulito en la pestaña del navegador para saber que css concreto debe cargar (que eso lo hago con un ifelse en layout.pug)
y asi con todo: galeria, contacto, error, gracias
*/ 
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

// GET gracias
router.get("/gracias", (req, res) => {
    res.render("gracias", { title: "Daut Tattoo - Gracias" });
});

// POST contacto
/* Cuando el user envia datos con el metodo post en /contacto, le decimos que espere que el servicio de email responda
Saca los datos (name email y message) del usuario (gracias a los middlewares urlencoded y express de index.js) y que me los muestre en consola
luego le pongo el html para el email, xk con texto plano... no se, se me hace aburrido HAHAHAH
sigo debajo del html del email xk es tan largo... lo hice usando uipath que tiene un creador de html integrado y vas viendo lo que haces y como queda HAHAHAH
uipath es un software de rpa, pero tiene esa facilidad y digo pues mira, la uso xD
*/
router.post("/contacto", async (req, res) => {
    const{ name, email, message} = req.body;
    console.log("Datos recibidos: ", name, ", ", email, ", ", message);
    
    // html pal email
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
    
    /* aqui tomamos la api de brevo de mi .env 
    (por seguridad, solo tu y yo vemos las apis, xk en github esta con el .gitignore jeje)
    */
    const client = SibApiV3Sdk.ApiClient.instance;
    const apiKey = client.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    const transacEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

    /* con senders y receivers definimos quien envia (el mio xk de momento pues pruebas, en adelante el de mi amigo) 
    y quien recibe (que seria mi amigo pero x las pruebas hasta que me corrijas los recibo yo, o tu si quieres cambiarlo en .env para que lo veas todito HAHAA)
    */
    const sender = {
        email: process.env.EMAIL_TO,
        name: "Web Daut Tattoo"
    };

    const receivers = [
        { email: process.env.EMAIL_TO },
    ];

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); 
    sendSmtpEmail.sender = sender;
    sendSmtpEmail.to = receivers;
    /* el replyto lo hice para que mi amigo cuando le de a responder en su gmail le abra directamente al email del cliente y no el suyo
    y con subject le defino el asunto del email y le paso el html que cree en uipath 
    */
    sendSmtpEmail.replyTo = { email: email, name: name };
    sendSmtpEmail.subject = `Nuevo mensaje de ${name} desde la web`;
    sendSmtpEmail.htmlContent = htmlEmail;

    /*fan namber 1 de los try catch, los usaria en todo con todo pero me controlo HAHAHA 
    con esto manejamos los errores, decimos que se espere hasta que brevo nos diga "ok enviado" o "error"
    si se envia con exito nos lleva a la pagina gracias
    si hay algun error lo metemos en el catch, que nos muestre en consola cual ha sido el error para identificarlo y poder trabajar con el
    y que redirija al user a la pagina /error para que sepa q salio mal, y ya el decida si esperar viendo fotitos o reintentarlo
    */
    try {
        await transacEmailApi.sendTransacEmail(sendSmtpEmail);
        console.log("Email enviado con éxito a Daut");
        res.redirect("/gracias");
        
    } catch (error) {
        console.error("ERROR al enviar el email:", error.response ? error.response.text : (error.message || error));
        res.redirect("/error");
    }
});

// exoirtamos este archivo para que index.js pueda usarlo
module.exports = router;