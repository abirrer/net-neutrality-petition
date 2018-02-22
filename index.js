const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const hb = require("express-handlebars");
const fs = require("fs");
const { signPetition } = require("./db");

//set up for handlebars

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

//middleware

app.use(cookieParser());

app.use(express.static(__dirname + "/public")); // includes stylesheet, javascript, images, etc.

app.use(function(req, res, next) {
    if (!req.cookies.signed && req.url != "/petition") {
        res.redirect("/petition");
    } else {
        next();
    }
});

app.use(
    bodyParser.urlencoded({
        extended: false
    })
);

//routes

app.get("/petition", function(req, res) {
    if (req.cookies.signed) {
        res.redirect("/thankyou");
        return;
    }
    res.render("petition");
});

app.post("/petition", function(req, res) {
    if (req.cookies.signed) {
        res.redirect("/thankyou");
        return;
    }
    if (!req.body.first || !req.body.last || !req.body.sig) {
        res.render("petition", { error: true });
    } else {
        signPetition(req.body.first, req.body.last, req.body.sig) // this function should make a db query that submits this to the database.
            .then(() => {
                res.cookie("signed", "true");
            })
            .then(() => {
                res.redirect("/thankyou");
            });
    }
});

app.get("/thankyou", (req, res) => {
    res.render("thankyou");
});

app.get("/signers", (req, res) => {
    res.render("signers");
});

app.listen(8080, () => console.log("I'm listening."));
