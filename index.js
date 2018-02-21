const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const hb = require("express-handlebars");
const fs = require("fs");

//set up for handlebars

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

//middleware

app.use(cookieParser());

app.use(
    bodyParser.urlencoded({
        extended: false
    })
);

app.use(express.static(__dirname + "/public")); // includes stylesheet, javascript, images, etc.

//routes

app.get("/petition", function(req, res) {
    res.render("petition");
});

app.post("/petition", function(req, res) {
    if (!req.body.first || !req.body.last || !req.body.sig) {
        res.render('petition', {
            error.true
        });
    } else {
        signPetition(req.body.first, req.body.last, req.body.sig) // this function should make a db query that submits this to the database.
        .then(function() {
            res.redirect("/thankyou");
        });
    }
});

app.get("/thankyou", (req, res) => {
    // if (check cookie) {
    //     res.redirect('/petition')
    // } else {
    res.render("thankyou");
    // }
}); // needs to be its own page so we can redirect to it many times.

app.get("/signers", (req, res) => {
    // if (check cookie) {
    //     res.redirect('/petition')
    // } else {
    res.render("signers");
    // }
});

app.listen(8080, () => console.log("I'm listening."));
