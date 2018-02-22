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

exports.signPetition = signPetition;
exports.getSig = getSig;
exports.getTotal = getTotal;

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
