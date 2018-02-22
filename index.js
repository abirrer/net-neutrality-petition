const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const hb = require("express-handlebars");
const fs = require("fs");
const { signPetition, getSig, getTotal } = require("./db");
var cookieSession = require("cookie-session");
var { secret } = require("./secrets");

//set up for handlebars

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

//middleware

//is there another place to put this or is this fine?
app.use(
    cookieSession({
        secret: secret,
        maxAge: 1000 * 60 * 60 * 24 * 14 //this means 14 days of complete inactivity
    })
);

app.use(cookieParser());

app.use(express.static(__dirname + "/public")); // includes stylesheet, javascript, images, etc.

app.use(function(req, res, next) {
    if (!req.session.signatureID && req.url != "/") {
        res.redirect("/");
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

app.get("/", function(req, res) {
    if (req.cookies.signed) {
        res.redirect("/thankyou");
        return;
    }
    res.render("petition");
});

app.post("/", function(req, res) {
    if (req.session.signatureID) {
        res.redirect("/thankyou");
        return;
    }
    if (!req.body.first || !req.body.last || !req.body.sig) {
        res.render("petition", { error: true });
    } else {
        signPetition(req.body.first, req.body.last, req.body.sig) // this function should make a db query that submits this to the database.
            .then(result => {
                req.session.signatureID = result.rows[0].id;
            })
            .then(() => {
                res.redirect("/thankyou");
            });
    }
});

app.get("/thankyou", (req, res) => {
    Promise.all([getSig(req.session.signatureID), getTotal()]).then(
        ([sigResult, totalResult]) => {
            res.render("thankyou", {
                sig: sigResult.rows[0].signature,
                num: totalResult.rows[0].count
            });
        }
    );
});

app.get("/signers", (req, res) => {
    res.render("signers");
});

app.listen(8080, () => console.log("I'm listening."));
