// logica principal de la app

const app = require("./src/app/index");

// puerto
const port = app.get("port");

// servidor escuchando al puerto
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});