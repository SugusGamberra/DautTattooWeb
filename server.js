// punto de entrada a mi web, el primer archivo que lee el server

// logica principal de la app: estoy importando toda la config de express que hice en index.js

const app = require("./src/app/index");

// puerto: defino el puerto en un solo lugar, lo saca de mi .env
const port = app.get("port");

// servidor escuchando al puerto: con esto express escucha las peticiones http de la variable port y para cuando hago npm run dev pues me puse ese console.log jeje
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});