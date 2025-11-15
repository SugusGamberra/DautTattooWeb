const router = require("express").Router();

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

// POST contacto
router.post("/contacto", (req, res, next) => {
    res.redirect("/gracias")
    next()
})

// GET gracias

router.get("/gracias", (req, res, next) => {
    res.render("gracias", { title: "Daut Tattoo - Gracias" })
    next()
})

module.exports = router;