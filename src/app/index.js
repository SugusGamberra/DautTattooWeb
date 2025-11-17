/* aqui se definen todos los settings y middlewares para gestionar las peticiones antes de pasarselas al router (que decide q pagina mostrar)
es el configurador principal: importa express, carga variables de entorno, le decimos donde estan mis plantillas .pug y los archivos estáticos
enchufa los middlewares y el router.js
*/

// importamos las librerias de express, morgan, mi archivo de rutas (router.js), path (para trabajar con las rutas y que funcione bien en cualquier SO) y creo la app (el objeto principal con el q rtabajo)
const express = require("express");
const app = express();
const morgan = require("morgan");
const router = require("./router/router");
const path = require("path");

// carga el archivo .env y pone todas sus variables dispos en process.env
require("dotenv").config();

/* settings: el cerebro de mi app...establezco el puerto de mi .env, y si no existe que use el 4040 por defecto (total en mi .env tengo el mismo pero weno HAHAHA se que hay puertos mejores y peores segun el proyecto pero por pereza pues...)
creo una variable que guarda la ruta exacta a mi carpeta de public, __dirname es la carpeta actual (src/app), sube un nivel (..) a /src y luego entra a public
*/

app.set("port", process.env.PORT || 4040);

const publicPath = path.join(__dirname, "..", "public");
app.set("views", `${publicPath}/templates`);

// le digo a express que .pug es mi motor de plantillas y en la linea anterior le digo donde esta ubicado
app.set("view engine", "pug");

// middlewares: es por donde pasa toda las peticiones antes de llegar a la ruta final y se ejecutan en orden

// permiten que express entienda los datos que llegan desde formularios (el de contacto) y los convierte en un objeto para usar en router.js
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// pongo a morgan a funcionar modo dev (formato de log corto y con colorinchis)
app.use(morgan("dev"));
// le dice a express que src/public tiene archivos estaticos, para q no pase x el router.js cuando piden .css
app.use(express.static(publicPath));
// le dice a express que para cualquier ruta que empiece con "/" (todas vaya) le pase el control a mi router.js
app.use("/", router);

// aqui exportamos la app totalmente configurada para que server.js pueda importarlo 
module.exports= app;