"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const app = express();
const PORT = 5000;
app.get("/", (req, res) => {
    res.send("Hello world!!");
});
app.listen(PORT, () => {
    console.log("Running on port : ", PORT);
});
