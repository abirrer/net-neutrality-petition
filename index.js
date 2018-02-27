//VARIABLES

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const hb = require("express-handlebars");
const {
    signPetition,
    getSig,
    getTotal,
    getAllSigs,
    addNewUser,
    getPassword,
    getAllSigsFiltered,
    addUserProfile,
    getUserProfile,
    deleteSignature
} = require("./db");

const cookieSession = require("cookie-session");
const { secret } = require("./secrets");
const { hashPassword, checkPassword } = require("./hash");
// const bcrypt = require("bcryptjs");
// const https = require("https");

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
            res.redirect("/profile"); //or do we make it res.redirect("profile");
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
            .then(hashedPass => {
                return addNewUser(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    hashedPass
                );
            })
            .then(result => {
                req.session.user = {
                    id: result.rows[0].id,
                    first: result.rows[0].first,
                    last: result.rows[0].last
                };
            })
            .then(() => {
                res.redirect("/profile");
            })
            .catch(error => {
                console.log(
                    "There was an error in the registration post request: ",
                    error
                );
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
            checkPassword(req.body.password, result.rows[0].hashed_password)
                .then(result => {
                    if (result == true) {
                        res.redirect("/petition");
                    } else {
                        res.render("login", {
                            error: true
                        });
                    }
                })
                .catch(error => {
                    console.log(
                        "There was an error in the login post request: ",
                        error
                    );
                });
        });
    }
});

//create profile page

app.get("/profile", (req, res) => {
    res.render("profile");
});

app.post("/profile", (req, res) => {
    addUserProfile(
        req.body.age,
        req.body.city,
        req.body.website,
        req.session.user.id
    )
        .then(() => {
            res.redirect("/petition");
        })
        .catch(error => {
            console.log(
                "There was an error in the profile post request: ",
                error
            );
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
    if (req.session.user.sigID) {
        res.redirect("/thankyou");
        return;
    }
    if (!req.body.sig) {
        res.render("petition", { error: true });
    } else {
        signPetition(
            req.session.user.first,
            req.session.user.last,
            req.body.sig,
            req.session.user.id
        ) // this function should make a db query that submits this to the database.
            .then(result => {
                req.session.user.sigID = result.rows[0].id;
            })
            .then(() => {
                res.redirect("/thankyou");
            })
            .catch(error => {
                console.log(
                    "There was an error in the petition post request: ",
                    error
                );
            });
    }
});

//thank you page

app.get("/thankyou", (req, res) => {
    Promise.all([getSig(req.session.user.sigID), getTotal()]).then(
        ([sigResult, totalResult]) => {
            res.render("thankyou", {
                sig: sigResult.rows[0].signature,
                num: totalResult.rows[0].count
            });
        }
    );
});

//edit profile pages

app.get("/profile/edit", (req, res) => {
    res.render("edit");
});

// app.post("/profile/edit", (req, res) => {
//
// });

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
    getAllSigsFiltered(req.params.city).then(result => {
        res.render("city", {
            city: req.params.city,
            signature: result.rows
        });
    });
});

app.listen(8080, () => console.log("I'm listening."));
