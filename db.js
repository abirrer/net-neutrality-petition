var spicedPg = require("spiced-pg");
var { dbUser, dbPass } = require("./secrets");

var db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/signatures`);

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

function signPetition(first, last, signature) {
    db
        .query(
            `INSERT INTO signatures (first, last, signature) VALUES (first, last, signature)`
        )
        .then(() => db.query(`SELECT * FROM signature`))
        .then(function(results) {
            console.log(results.rows);
        })
        .catch(function(err) {
            console.log(err);
        });
}
