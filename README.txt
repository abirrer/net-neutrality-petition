//Part 1 Notes
Needs to be text field for first and last name.
Canvas on the page
Submit button
WHen submit button is pressed, this page goes away.
Every click on every link and every submit will make the page go away and a new one come up.

Generate pages on the html server with handlebar servers.  Every single page has something dynamic on it,
so you will need express handlebars to create each page.
Create the html on the server before sending it.
This page requires client-side javascript.
Need javascript for event handling, its simple.
It's not different than first event exercise we did with the box following the mouse.
This code needs to detect mouse down on the canvas.  When the mouse goes down, star tlistening for mouse move.
As mouse move on the canvas, draw a line (use mouse to). Need offset x and offset y on the mouse down.
THen when move mouse, detect mouse move and overwrite the mouse variables where it used to be to where it was.
Draw a line from where it used to be to where it is now.
when mouseup, stop drawing.
when mouse goes down, start tracking mouse move, and stop tracking mouse move when mouse up.
keep track of where the mouse used to be.

when the user clicks submit, we want to put a new row in our database.
Table will be like:

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    first VARCHAR(200) NOT NULL,
    last VARCHAR(200) NOT NULL,
    signature TEXT NOT NULL //text datatype has no set limit.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

We will translate the canvas into text and save that signature.
We will be dropping this table, and removing/adding columns to it.
Can add a time stamp to if it you want.
the signature will be a very very big string.

How to get it:
find the canvas on the pages
var c = document.querySelector('canvas');
c.toDataURL() //this is a method of the canvas
and the output is an actual image data for the canvas.
Can put the c.toDataURL() can then be put into the src code of an img element.
submit this signature data string to the server and input into the database.

in HTML form:
<form method=POST>
    <label><input type=text name=last>Last Name"</label>
    <input type=hidden name=sig value="c.toDataURL"> //Have to write javascript code to call the c.todataURL and puts it in the value of a hidden field.  That way when the user submits the form, it goes back to the server.

Code for this woudl be:

$('input[name='sig']').val(myCanvas.toDataURL()).
The question is also, when to do this.  It changes everytime the mouse ups on the canvas.
That's when the field is set to the current value.
Another good time to do it is when the user clicks the submit button.  BUT either way,
it has to be before the form is sent to the server.

When user clicks submit, it has 3 fields
causes a db query to happen, which inputs to the database the 3 fields.
Then a question about if that works. Would have to test that all 3 fields are there.
if they are not there, then you should send an error.

This means show an error page.
This should be the same page as the petition page, but has an error message in it.
No requirement about what the error message should be.
This page needs to be created with handelbars so it can show an error message.

code:
app.use(express.static('./public')); includes stylesheet, javascript, images, etc.

app.get("/petition", function (req, res) {
    res.render('petition')
})

app.post('/petition', function(req, res) {
    if (!req.body.first || !req.body.last || !req.body.sig) {
        res.render('petition, {
            error.true
            });
    } else {
        signPetition(req.body.first, req.body.last, req.body.sig) // this function should make a db query that submits this to the database.
            .then(function() {
                res.redirect('/thanks')
            })
    }
})

app.get(/'thanks', () => {}) //needs to be its own page so we can redirect to it many times.

res.redirect to the thank you page. shows how many people signed the petition already (not a requirement), the server does a db query to get the count of how many people have signed the rows. passes the data to the template to render this.
What is required is that you have a link to our 3rd page, the signers page.
this lists all the people who have signed the petition, first and last name, but not their signature.
We're considering the signature as private data.  Signatures can only be shown by the person whose it is.
We will never show the signature but the person it belongs to.
pass the rows to a handlebars template to display the names.

People can only see the 2nd and 3rd pages if someone has signed a petition.
After someone successfully signs the petition, we set a cookie to remember they've signed.
Like accept the cookie policy last week. Very similar.

If someone has the cookie that they've signed, then we redirect them to the thank you page.
If someone shows up to the 2nd or 3rd page that hasn't signed them, then redirect them to the petition 1st page (this is the only page they should see),


cookie parser
body parser
express static
set up views directory
handlebars
create table for database.
people usually create an index.js where they do their express stuff.
it has the routes.
    const express = require('express');
    all app.get stuff

then a db.js that has
all db stuff
that should Have
exports.signPetition = function() {
    return db.query()
}
in the route you could do the .then

create a javascript filethat you put in publicstatis directory
to do all the canvas stuff

need template files for the petition page, the thankyou page, the signers page.

might want a layout file so you don;t have to repeat all that stuff.

Maybe some partials based on your design. for repeating elements (like images, etc.)

Tomorrow morning, when we talk about Part 2, many of us will be working on Part 1.


//Part 2 Notes
Just a change to the thank you page, to show the user their signature they signed.

The object will look like this.
{
    user1: {
        signature: 'data'
    },
    user2: {
        signature: 'data'
    }
}
put the session id in the cookie, then put the session data on the server,
and then pull it back up based on session id.
Need a place to store this data.
this is not what postgres is for. It's only for permanent stuff, and involved queries.

This is something you only keep around when the user visits the site. but when they leave the sight, then have no interest in keeping it.
reddis is a good thing for this.

Today we will use a hybrid approach called cookie sessions.
The cookie shoudl get the ID of the signature, can't put the full signature.
We can look up the signature with the ID from the cookie.

session will contain a json stringified object { signatureID: 11 } but it is base64 encoded.
session.sig is a signed cookie, to authenticate it.  It's called a HMAC -hash.
a cryptographic hash is a jumbled up string that is completely unrecognizable and impossible to go back to the original
Always generates the same hash for the same string.  But impossible to decode.

how to put data in the sessino cookie

app.get('*', (req, res) => {
    console.log(req.session.signatureID);
    req.session.signatureID = 10;
    res.sendStatus(200)
})


What you want to do is do the setup stuff from github.
put the secret in a secrets.json file and then reference it in index.
In your post route when user has successfully submitted their signature.
Delete the res.cookie("hasSigned", "true").  We don't need this anymore.
ALso don't need req.cookies to read the cookie.

when we want to set cookie,
do
req.session.signatureId = id of signature which is result.rows[0].id

then we do if (req.session.signatureID) {
    // then do the rest.
}

then in db.js, we need to get the id:

change the query to get back (from an insert)

function signPetition(first, last, signature) {
    return db.query(
        `INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3) RETURNING id`,
        [first, last, signature]
    );
}

then we will get back the id:.

Then set this to the req.session.signatureId.

When the post happens, you need to modify the thank you route which just now res.renders.
It first has to do a db.query first before rendering.
db query requres req.session.signatureId so Select signature from Signatures where {req.session.signatureId}

then pass that to render template.

res.render('thanks', {
    sig: result.rows[0].sig
})

in template do <img src="{{sig}}">

* set up cookie session middleware
* then change post route from setting cookie with res.cookie.  set signature id in res.session.
* then thankyou route needs to change. first do database query then render.
the database query needs signatureid from session.
then pass it to the template and render it.

then change where the person has already signed.  Change it to req.session.signatureId before redirecting.

//Notes from 26 February: More SQL and Part 4

//COMMANDS
how to create a database in bash: createdb <db_name>
CREATE TABLE <table_name (...);
to run a file: psql <table_name> -f <path/to/file_name.js>
psql -l
/dt
/du

in postgres to set up foreign key "REFERENCES [tablename](column name)" so example: REFERENCES actors(id);
Order of dropping tables depends when you have these foreign key dependencies.

Rule for writing code: be obnoxiously consistent with naming things.

Every JOIN needs an ON clause need to know where the rows from table B will join with the rows of Table A


//Notes on Part 4
Register and then go to a second page to add additional details.
Make a new table --> all fields are allowed to be null.
Add additional profile information in the signers page, include link to homepage.
City name should also be links, when the links are clicked, users are directed to a signers page that is filtered to just include signers from that city.

Post request and get request for the additional information page.

need to use:

/petition/signers/:user_city
const city = req.params.user_city
city === "berlin"

have to write a query in a get request. you Want it when you load the page, so you use get not post.

app.get("petition/signers/:user_city", (req, res) => {
    //query my db for all the signers
    //who have the city equal to whatever
    //req.params.city is.
    //In the db function, need to join tables.
})

addUserProfile(req.session.userId, name) //this goes in the index.js

//this goes in to the db query page
function addUserProfile(userID, name) {
    const q = "INSERT INTO user_profiles (user_id, name)
        VALUES ($1, $2)"
    const params = [userId, name]
}


//Part 5 Notes

need to do a join query from users and user profiles data.
The password field is left blank.
Age, City, Homepage are optional. so if they don't have a value, then display nothing.

to update, we need a post request from this form.
WE are updating 2 different tables, users and user profiles.
WE need to run 2 update statements if necessary. It's a fat post request with lots of conditions to check for.
One of those conditions is: if the user does not have a row in the user profiles table. since they didn't need to submit anything.
If they don't have a row, then we do an insert query.
If they do have a row, then we run an update query

for query:

UPDATE user_profiles
    SET city = $1 //whatever we want to update
    WHERE user_id = $2,
    [userInputtedCity || null , req.session.user.id]

INSERT INTO user_profiles
    (city, age, url) VALUES ($1, $2, $3)
    const params = [ userInputtedCity || null, age || null, url || null ]

For resubmission of password:

app.post("/profile/edit", (req, res) => {

const { id } = req.session.user;
const { first, last, email, password, age, city, url } = req.body;
    or
    req.body.first;
    req.body.last;
    req.body.email;
    req.body.password;
    req.body.age;
    req.body.city;
    req.body.url;

    if (password === "") {
        //skip the whole updating password thing
        //aka don't do the update query
    } else {
        //update the password and run the hashPassword function and then save the hash.
    }
})

Should be able to delete the signature.
Add options to edit your profile
and delete your signature.
When they click the button it should be DELETE query in a post request for this.

syntax for deleting is:

DELETE FROM signatures WHERE user_id = $1
[req.session.user.id]

in index.js:
Then reset req.session.user.sigID = null;
or do delete req.session.user.sigID;

on submit, just resubmit the first, last, email fields.


examples of middleware:

//only use this middleware for routes that require a sigID
//like GET /signers, GET /thankyou, GET /signers/:city
const checkForSigId = function(req, res, next) {
    if (!req.session.user.sigID) {
        res.redirect('/petition')
    } else {
        next();
    }
}

//use for any routes that require being logged in
//basically every page except registration and login
const checkForLoggedIn = function (req, res, next) {
    if (!req.session.user) {
        res.redirect('/registration')
    } else {
        next()
    }
}

app.get("/login", (req, res) => {})
app.get("/registration", (req, res) => {})

app.get("/thankyou", checkForLoggedIn, checkForSigId, (req, res) => {})
app.get("/signers", checkForLoggedIn, checkForSigId, (req, res) => {})
app.get("/signers/city", checkForLoggedIn, checkForSigId, (req, res) => {})



//Notes on csurf

in index.js
//need to use csrf
 app.use(cookieSession({ secret: secret, maxAge: 60 * 60 * 12 *14 }))
 # this is method #1:
 app.use(csrf());

 #method #2:
 let csrfProtection = csrf()
 //then pass this to every app.get which has a form.

//then need to require it
app.get("/", (res, req) => {
    res.render('registration', { csrfToken: req.csrfToken() })
})

in index.handlebars:

<form>
    <input type="hidden" name="_csrf" value="{{csrfToken}}">
    <input type="text" name="info" placeholder="enter info">
    <button type="submit" name="button">Send Info</button>
</form>


//NOTES ON REDIS INTEGRATION IN PETITION

redis is introducing instability.
to eliminate all risks.

git branch lists all branch
Create a new branch - branch off of existing branch.
Push branch to the remote
then git checkout -b annabirrerredis origin/annabirrer

if this branch, do all redis work and only redis work.
Only use this branch when you're using redis.

do a redis setex, then stringify that array in a key.

example code at top of index.js:
// const cache = require("./cache");
//
// cache
//     .setex(
//         "goodstuff",
//         30,
//         JSON.stringify({
//             funk: "chicken",
//             disco: "duck"
//         })
//     )
//     .then(() => cache.get("goodstuff"))
//     .then(val => {
//         val = JSON.parse(val);
//         console.log(val);
//     });

don't need to do this for signers/:city.

need to invalidate the cache at the right itmes.

Call del any time a new person signs, someone deletes their signature, when someone changes their first/last/age/url/city.
Delete the key from redis.

When you delete you might want to go get the signers right then and put them in redis, so that it's already there.
It's called warming the cache.
don't need to warm the cache, at first just go get the signers.

for Bonus exercise,
key would be based on email address.
