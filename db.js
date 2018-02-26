var spicedPg = require("spiced-pg");
var { dbUser, dbPass } = require("./secrets");

var db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/signatures`);

function signPetition(first, last, signature) {
    return db.query(
        `INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3) RETURNING id`,
        [first, last, signature]
    );
}

function getSig(signatureID) {
    return db.query(`SELECT signature FROM signatures WHERE id = $1`, [
        signatureID
    ]);
}

function getTotal() {
    return db.query(`SELECT COUNT (signature) FROM signatures`);
}

function getAllSigs() {
    return db.query("SELECT first, last FROM signatures");
}

function addNewUser(first, last, email, password) {
    return db.query(
        `INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id`,
        [first, last, email, password]
    );
}

function getPassword(email) {
    return db.query(`SELECT * FROM users WHERE email = $1`, [email]);
}

function getAllSigsFiltered(city) {
    return db.query();
}

function addUserProfile(age, city, website) {
    return db.query(
        `INSERT INTO user_profiles (age, city, website) VALUES ($1, $2, $3) RETURNING id`,
        [age, city, website]
    );
}

exports.signPetition = signPetition;
exports.getSig = getSig;
exports.getTotal = getTotal;
exports.getAllSigs = getAllSigs;
exports.addNewUser = addNewUser;
exports.getPassword = getPassword;
exports.getAllSigsFiltered = getAllSigsFiltered;
exports.addUserProfile = addUserProfile;

// function getCityInfo(city, country) {
//     db
//         .query("SELECT city FROM cities WHERE city = $1 AND country = $2", [
//             city,
//             country
//         ])
//         .then(function(results) {
//             console.log(results.rows);
//         })
//         .catch(function(err) {
//             console.log(err);
//         });
// }
//
// db
//     .query(
//         `INSERT INTO cities (city, population, country)
//         VALUES ('Palookaville', 10, 'New Palooka')`
//     )
//     .then(() => db.query(`SELECT city FROM cities`))
//     .then(function(results) {
//         console.log(results.rows);
//     })
//     .catch(function(err) {
//         console.log(err);
//     });
