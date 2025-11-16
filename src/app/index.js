const express = require("express");
const app = express();
const morgan = require("morgan");
const router = require("./router/router");

require("dotenv").config();

// settings

app.set("port", process.env.PORT || 4040);

const publicPath = __dirname.replace("app", "public");
app.set("views", `${publicPath}/templates`);

app.set("view engine", "pug");

// middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(publicPath));
app.use("/", router);

module.exports= app;