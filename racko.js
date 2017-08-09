var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth - 50;
canvas.height = window.innerHeight / 2;

var c = canvas.getContext('2d');

var mouse = {
    x: undefined,
    y: undefined
}

window.addEventListener('mousemove',
    function(event) {
        mouse.x = event.x;
        mouse.y = event.y;
    }
)
