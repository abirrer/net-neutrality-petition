// This page requires client-side javascript.
// Need javascript for event handling, its simple.
// It's not different than first event exercise we did with the box following the mouse.
// This code needs to detect mouse down on the canvas.  When the mouse goes down, star tlistening for mouse move.
// As mouse move on the canvas, draw a line (use mouse to). Need offset x and offset y on the mouse down.
// THen when move mouse, detect mouse move and overwrite the mouse variables where it used to be to where it was.
// Draw a line from where it used to be to where it is now.
// when mouseup, stop drawing.
// when mouse goes down, start tracking mouse move, and stop tracking mouse move when mouse up.
// keep track of where the mouse used to be.
//
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
