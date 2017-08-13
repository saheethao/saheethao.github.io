
var canvas = document.getElementById("canvas");
canvas.width = 500;
canvas.height = 500;

if (canvas.getContext) {

    var ctx = canvas.getContext("2d");

    var rot = 0;

    var TO_RADIANS = Math.PI/180.0;

    var speed = 1;

    var img = new Image();

    img.src = "image/llama-1.png";

    img.onload = function() {

        ctx.drawImage(img, 20, 20);

    };

    function rotate() {

        var xOffset = img.width / 2;

        var yOffset = img.height / 2;

        ctx.save();

        ctx.translate(xOffset, yOffset);

        rot = rot +speed;

        if(rot == 360) rot = 0;

        ctx.rotate(rot*TO_RADIANS);

        ctx.drawImage(img, -img.width/2, -img.height/2);

        ctx.restore();

    }

    setInterval(rotate, 50);

    canvas.addEventListener('mouseover', function(evt) {

        speed = 10;

    }, false);

    canvas.addEventListener('mouseout', function(evt) {

        speed = 1;

    }, false);

}

