var canv = $("canvas");
var ctx = canv[0].getContext("2d");
var draw;
var mouseX;
var mouseY;

canv.on("mousedown", function(e) {
    draw = true;
    // console.log("mousedown");
    mouseX = e.offsetX;
    mouseY = e.offsetY;
    console.log(mouseX, mouseY);
});

canv.on("mousemove", function(e) {
    if (!draw) {
        return;
    }
    // console.log("mousemove");
    ctx.moveTo(mouseX, mouseY);
    mouseX = e.offsetX;
    mouseY = e.offsetY;
    ctx.lineTo(mouseX, mouseY);
    ctx.stroke();
});

canv.on("mouseup", function(e) {
    // console.log("mouseup");
    draw = false;
    $('input[name="sig"]').val(canv[0].toDataURL());
});

// when the user clicks submit, we want to put a new row in our database.
//
// var c = document.querySelector('canvas');
// c.toDataURL() //this is a method of the canvas
// and the output is an actual image data for the canvas.
// Can put the c.toDataURL() can then be put into the src code of an img element.
// submit this signature data string to the server and input into the database.
//
// in HTML form:
// <form method=POST>
//     <label><input type=text name=last>Last Name"</label>
//     <input type=hidden name=sig value="c.toDataURL"> //Have to write javascript code to call the c.todataURL and puts it in the value of a hidden field.  That way when the user submits the form, it goes back to the server.
//
// Code for this woudl be:
//
// $('input[name='sig']').val(myCanvas.toDataURL()).
// The question is also, when to do this.  It changes everytime the mouse ups on the canvas.
// That's when the field is set to the current value.
// Another good time to do it is when the user clicks the submit button.  BUT either way,
// it has to be before the form is sent to the server.
//
// When user clicks submit, it has 3 fields

// causes a db query to happen, which inputs to the database the 3 fields.
// Then a question about if that works. Would have to test that all 3 fields are there.
// if they are not there, then you should send an error.
