//VARIABLES

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const hb = require("express-handlebars");
const https = require("https");
const {
    signPetition,
    getSig,
    getTotal,
    getAllSigs,
    addNewUser,
    getPassword,
    getAllSigsFiltered,
    addUserProfile
} = require("./db");

var cookieSession = require("cookie-session");
var { secret } = require("./secrets");
const { hashPassword, checkPassword } = require("./hash");
var bcrypt = require("bcryptjs");

//set up for handlebars

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

//MIDDLEWARE

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
    if (!req.url != "/" || req.url != "/login") {
        if (!req.session.user && req.url != "/") {
            res.redirect("/");
        } else {
            next();
        }
    } else {
        if (req.session.user) {
            res.redirect("/petition");
        } else {
            next();
        }
    }
});

app.use(
    bodyParser.urlencoded({
        extended: false
    })
);

//ROUTES

//homepage/registration page
app.get("/", (req, res) => {
    res.render("registration");
});

app.post("/", (req, res) => {
    if (
        !req.body.first ||
        !req.body.last ||
        !req.body.email ||
        !req.body.password
    ) {
        res.render("registration", { error: true });
    } else {
        hashPassword(req.body.password)
            .then(result => {
                addNewUser(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    result
                );
            })
            .then(() => {
                getPassword(req.body.email).then(result => {
                    req.session.user = {
                        id: result.row[0].id,
                        first: result.row[0].first,
                        last: result.row[0].last
                    };
                });
            })
            .then(() => {
                res.redirect("/profile");
            });
    }
});

//login page

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.render("login", {
            error: true
        }); //need to update that error shows and test.
    } else {
        getPassword(req.body.email).then(result => {
            req.session.user = {
                id: result.rows[0].id,
                first: result.rows[0].first,
                last: result.rows[0].last
            };
            checkPassword(req.body.password, result.rows[0].password).then(
                result => {
                    if (result == true) {
                        res.redirect("/petition");
                    } else {
                        res.render("login", {
                            error: true
                        });
                    }
                }
            );
        });
    }
});

//profile page

app.get("/profile", (req, res) => {
    res.render("profile");
});

app.post("/profile", (req, res) => {
    addUserProfile(req.body.age, req.body.city, req.body.website).then(() => {
        res.redirect("/petition");
    });
});

//sign petition page

app.get("/petition", function(req, res) {
    if (req.cookies.signed) {
        res.redirect("/thankyou");
        return;
    }
    res.render("petition");
});

app.post("/petition", function(req, res) {
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

//thank you page

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

//signers page

app.get("/signers", (req, res) => {
    getAllSigs().then(result => {
        res.render("signers", {
            signature: result.rows
        });
    });
});

//city page

app.get("/signers/:city", (req, res) => {
    getAllSigsFiltered().then(result => {
        res.render("city", {
            city: req.params.city,
            signature: result.rows
        });
    });
});

app.listen(8080, () => console.log("I'm listening."));
