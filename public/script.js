var canv = $("canvas");
var ctx = canv[0].getContext("2d");
var draw;
var mouseX;
var mouseY;

canv.on("mousedown", function(e) {
    draw = true;
    mouseX = e.offsetX;
    mouseY = e.offsetY;
    console.log(mouseX, mouseY);
});

canv.on("mousemove", function(e) {
    if (!draw) {
        return;
    }
    ctx.moveTo(mouseX, mouseY);
    mouseX = e.offsetX;
    mouseY = e.offsetY;
    ctx.lineTo(mouseX, mouseY);
    ctx.stroke();
});

canv.on("mouseup", function(e) {
    draw = false;
    $('input[name="sig"]').val(canv[0].toDataURL());
});
