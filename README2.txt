//NEW CODE
app.post("/profile/edit"), (req, res) => {

    let updateUserProfileTablePromise = updateUserProfileTable(
        req.body.age,
        req.body.city,
        req.body.website,
        req.session.user.id
    )

    let updateUsersTablePromise = () => {
        if (!req.body.password) {
            updateUsersTableNoPass(
                req.body.first,
                req.body.last,
                req.body.email,
                req.session.user.id
            )
        } else {
            hashPassword(req.body.password).then(hashedPass => {
                updateUsersTableWithPass(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    hashedPass,
                    req.session.user.id
                )
            });
        }
    }

    Promise.all([updateUserProfileTablePromise, updateUsersTablePromise]).then(() => {
        res.redirect("/profile/edit");
    }).catch(error => {
        console.log(
            "There was an error in the profile edit post request: ", error
        );
    })
}

//OLD CODE
app.post("/profile/edit", (req, res) => {
    //need to set a promise.all to determine when the updateUserProfileTable and updateUsersTable are both complete.  Then send res.redirect("/profile/edit")
    updateUserProfileTable(
        req.body.age,
        req.body.city,
        req.body.website,
        req.session.user.id
    )
        .then(() => {
            res.redirect("/profile/edit");
        })
        .catch(error => {
            console.log(
                "There was an error in the profile edit post request: ",
                error
            );
        });
    if (!req.body.password) {
        updateUsersTableNoPass(
            req.body.first,
            req.body.last,
            req.body.email,
            req.session.user.id
        )
            .then(() => {
                res.redirect("/profile/edit");
            })
            .catch(error => {
                console.log(
                    "There was an error in the profile edit post request: ",
                    error
                );
            });
    } else {
        hashPassword(req.body.password).then(hashedPass => {
            updateUsersTableWithPass(
                req.body.first,
                req.body.last,
                req.body.email,
                hashedPass,
                req.session.user.id
            )
                .then(() => {
                    res.redirect("/profile/edit");
                })
                .catch(error => {
                    console.log(
                        "There was an error in the profile edit post request: ",
                        error
                    );
                });
        });
    }
});


//THIS IS FOR EMBEDDING GOOGLEMAPS
const cities = signers.map(signers => signers.city)

res.render("signers", {
    signers,
    cities: cities.join(", ")
});

<iframe src="https:maps.google.com?cities={{cities}}"
