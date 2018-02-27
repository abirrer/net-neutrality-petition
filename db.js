var spicedPg = require("spiced-pg");
var { dbUser, dbPass } = require("./secrets");

var db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/signatures`);

function signPetition(first, last, signature, user_id) {
    return db.query(
        `INSERT INTO signatures (first, last, signature, user_id) VALUES ($1, $2, $3, $4) RETURNING id`,
        [first, last, signature, user_id]
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
    return db.query(`SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.website FROM users
        JOIN user_profiles
        ON users.id = user_profiles.user_id`);
}

function addNewUser(first, last, email, password) {
    return db.query(
        `INSERT INTO users (first, last, email, hashed_password) VALUES ($1, $2, $3, $4) RETURNING id`,
        [first, last, email, password]
    );
}

function getPassword(email) {
    return db.query(`SELECT * FROM users WHERE email = $1`, [email]);
}

function getAllSigsFiltered(city) {
    return db.query(
        `SELECT users.first, users.last, user_profiles.age FROM users
        JOIN user_profiles
        ON users.id = user_profiles.user_id
        WHERE city = $1`,
        [city]
    );
}

function addUserProfile(age, city, website, user_id) {
    return db.query(
        `INSERT INTO user_profiles (age, city, website, user_id) VALUES ($1, $2, $3, $4)`, //do I need to return something here?
        [age, city, website, user_id]
    );
}

function getUserProfile(user_id) {
    return db.query(
        `SELECT users.first, users.last, users.email, users.password, user_profiles.age, user_profiles.city, user_profiles.website FROM users
        JOIN user_profiles
        ON users.id = user_profiles.user_id
        WHERE id = $1`,
        [user_id]
    );
}

// function updateUserProfile(
//     first,
//     last,
//     email,
//     password,
//     age,
//     city,
//     website,
//     user_id
// ) {
//     return db.query(
//         `UPDATE users
//         SET first = $1, last = $2, email = $3
//         WHERE id = $4`,
//         [first, last, email, user_id]
//     );
//     getUserProfile(age, city, website, user_id); //can't do this, but need to figure out another way
// }

function deleteSignature(user_id) {
    return db.query(
        `DELETE FROM signatures
        WHERE id = $1`,
        [user_id]
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
exports.getUserProfile = getUserProfile;
// exports.updateUserProfile = updateUserProfile;
exports.deleteSignature = deleteSignature;
