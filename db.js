var spicedPg = require("spiced-pg");

if (!process.env.DATABASE_URL) {
    var { dbUser, dbPass } = require("./secrets");
}

var db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${dbUser}:${dbPass}@localhost:5432/signatures`
);

function signPetition(signature, user_id) {
    return db.query(
        `INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING id`,
        [signature, user_id]
    );
}

function getSig(signatureID) {
    return db.query(`SELECT signature FROM signatures WHERE id = $1`, [
        signatureID
    ]);
}

function getTotal() {
    return db.query(`SELECT COUNT (user_id) FROM signatures`);
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
    return db.query(
        `SELECT users.id, users.first, users.last, users.hashed_password, signatures.id AS sig_id FROM users
        JOIN signatures
        ON users.id = signatures.user_id
        WHERE email = $1`,
        [email]
    );
}

function getAllSigsFiltered(city) {
    return db.query(
        `SELECT users.first, users.last, user_profiles.age FROM users
        JOIN user_profiles
        ON users.id = user_profiles.user_id
        WHERE lower(city) = lower($1)`,
        [city]
    );
}

function addUserProfile(age, city, website, user_id) {
    return db.query(
        `INSERT INTO user_profiles (age, city, website, user_id) VALUES ($1, $2, $3, $4)`, //do I need to return something here?
        [age || null, city || null, website || null, user_id]
    );
}

function getUserProfile(user_id) {
    return db.query(
        `SELECT users.first, users.last, users.email, users.hashed_password, user_profiles.age, user_profiles.city, user_profiles.website FROM users
        LEFT JOIN user_profiles
        ON users.id = user_profiles.user_id
        WHERE users.id = $1`,
        [user_id]
    );
}

function updateUserProfileTable(age, city, website, user_id) {
    return db.query(
        `INSERT INTO user_profiles (age, city, website, user_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id)
        DO UPDATE
        SET age = $1, city = $2, website = $3
        WHERE user_profiles.user_id = $4`,
        [age || null, city || null, website || null, user_id]
    );
}

function updateUsersTableWithPass(first, last, email, hashed_password, id) {
    return db.query(
        `UPDATE users
        SET first = $1, last = $2, email = $3, hashed_password = $4
        WHERE id = $5`,
        [first, last, email, hashed_password, id]
    );
}

function updateUsersTableNoPass(first, last, email, id) {
    return db.query(
        `UPDATE users
        SET first = $1, last = $2, email = $3
        WHERE id = $4`,
        [first, last, email, id]
    );
}

function deleteSignature(user_id) {
    return db.query(
        `DELETE FROM signatures
        WHERE user_id = $1`,
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
exports.updateUserProfileTable = updateUserProfileTable;
exports.updateUsersTableWithPass = updateUsersTableWithPass;
exports.updateUsersTableNoPass = updateUsersTableNoPass;
exports.deleteSignature = deleteSignature;
