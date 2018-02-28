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
    deleteSignature,
    updateUserProfileTable,
    updateUsersTableWithPass,
    updateUsersTableNoPass
} = require("./db");
const cookieSession = require("cookie-session");
const { secret } = require("./secrets");
const { hashPassword, checkPassword } = require("./hash");
const https = require("https");
const csrf = require("csurf");

//set up for handlebars

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

//MIDDLEWARE

//is there another place to put this or is this fine?
app.use(
    cookieSession({
        secret: process.env.SESSION_SECRET || require("./secrets").secret,
        maxAge: 1000 * 60 * 60 * 24 * 14 //this means 14 days of complete inactivity
    })
);

app.use(cookieParser());

app.use(express.static(__dirname + "/public")); // includes stylesheet, javascript, images, etc.

app.use(function(req, res, next) {
    if (!req.session.user) {
        if (req.url != "/" && req.url != "/login") {
            res.redirect("/");
        } else {
            next();
        }
    } else {
        if (req.url == "/" || req.url == "/login") {
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

app.use(csrf());

//ROUTES

//homepage/registration page
app.get("/", (req, res) => {
    res.render("registration", { csrfToken: req.csrfToken() });
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
    res.render("login", { csrfToken: req.csrfToken() });
});

app.post("/login", (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.render("login", {
            error: true
        }); //need to update that error shows and test.
    } else {
        getPassword(req.body.email).then(getPasswordResult => {
            checkPassword(
                req.body.password,
                getPasswordResult.rows[0].hashed_password
            )
                .then(result => {
                    if (result == true) {
                        req.session.user = {
                            id: getPasswordResult.rows[0].id,
                            first: getPasswordResult.rows[0].first,
                            last: getPasswordResult.rows[0].last,
                            sigID: getPasswordResult.rows[0].sig_id
                        };
                        res.redirect("/thankyou");
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
    res.render("profile", { csrfToken: req.csrfToken() });
});

app.post("/profile", (req, res) => {
    addUserProfile(
        +req.body.age,
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
    if (req.session.user.sigID) {
        res.redirect("/thankyou");
        return;
    }
    res.render("petition", { csrfToken: req.csrfToken() });
});

app.post("/petition", function(req, res) {
    if (req.session.user.sigID) {
        res.redirect("/thankyou");
        return;
    } else if (!req.body.sig) {
        res.render("petition", { csrfToken: req.csrfToken(), error: true });
    } else {
        console.log(req.body.sig);
        signPetition(req.body.sig, req.session.user.id)
            .then(result => {
                console.log(result);
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
                num: totalResult.rows[0].count,
                csrfToken: req.csrfToken()
            });
        }
    );
});

//delete signature on thank you page

app.post("/thankyou", (req, res) => {
    deleteSignature(req.session.user.id)
        .then(() => {
            delete req.session.user.sigID;
        })
        .then(() => {
            res.redirect("/petition");
        })
        .catch(error => {
            console.log(
                "There was an error in the thankyou post request: ",
                error
            );
        });
});

//edit profile pages

app.get("/profile/edit", (req, res) => {
    getUserProfile(req.session.user.id).then(result => {
        console.log(result);
        res.render("edit", {
            first: result.rows[0].first,
            last: result.rows[0].last,
            email: result.rows[0].email,
            password: "",
            age: result.rows[0].age,
            city: result.rows[0].city,
            website: result.rows[0].website,
            csrfToken: req.csrfToken()
        });
    });
});

app.post("/profile/edit", (req, res) => {
    if (req.body.logout) {
        req.session = null;
        res.redirect("/login");
    } else {
        let updateUserProfileTablePromise = updateUserProfileTable(
            req.body.age,
            req.body.city,
            req.body.website,
            req.session.user.id
        );

        let updateUsersTablePromise = (() => {
            if (!req.body.password) {
                return updateUsersTableNoPass(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    req.session.user.id
                );
            } else {
                return hashPassword(req.body.password).then(hashedPass => {
                    return updateUsersTableWithPass(
                        req.body.first,
                        req.body.last,
                        req.body.email,
                        hashedPass,
                        req.session.user.id
                    );
                });
            }
        })();

        Promise.all([updateUserProfileTablePromise, updateUsersTablePromise])
            .then(() => {
                res.redirect("/profile/edit");
            })
            .catch(error => {
                console.log(
                    "There was an error in the profile edit post request: ",
                    error
                );
            });
    }
});

// app.post("/logout", (req, res) => {
//     req.session = null;
//     res.redirect("/login");
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

app.listen(process.env.PORT || 8080, () => console.log("I'm listening."));
