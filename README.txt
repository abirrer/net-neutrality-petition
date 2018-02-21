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
