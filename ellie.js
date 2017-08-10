$(document).ready(function() {
    $("#heart").click(function () {
        console.log("I love you");
        var w = window.innerWidth;
        var h = window.innerHeight;

        var top = Math.floor(Math.random() * h);
        var left = Math.floor(Math.random() * w);
        var love = "<p style='top: " + top + "px; left: " + left +"px;'>I love you</p>";
        $("body").append(love);
    });
});
