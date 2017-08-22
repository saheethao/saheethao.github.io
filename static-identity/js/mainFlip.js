$(function () {
    $.mobile.loader.prototype.options.disabled = true;
    $.event.special.tap.tapholdThreshold = 1000,
        $.event.special.swipe.durationThreshold = 500;

    var mode;
    var max;
    var id;
    var name;
    var gameArray;

    var team = '';
    var role = 'teammate';

    $('#main .submit').click(function() {
        if (setUser()) {
            console.log('OK');
            var gameMax = max;
            gameArray = [];
            if (max % 2 == 1) {
                gameArray.push("gambler");
                gameMax -= 1;
            }
            gameArray.push('president');
            gameMax -= 1;

            gameArray.push('bomber');
            gameMax -= 1;

            for (var i = 0; i < gameMax / 2; i += 1) {
                gameArray.push('bomber-teammate');
            }

            for (var i = 0; i < gameMax / 2; i += 1) {
                gameArray.push('president-teammate');
            }

            var gameID = id - 1;

            renderCard(gameID);


        } else {
            console.log('error');
        }
    });

    $('#help').click(function() {
        renderHelp();
    });




    var entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };

    function setUser() {
        console.log('Setting values...');

        mode = $('#mode-input').val();
        seed = $('#seed-input').val();
        max = $('#max-input').val();
        id = $('#id-input').val();
        name = $('#name-input').val();


        seed = parseInt(seed);
        id = parseInt(id);
        name = escapeHtml(name);

        console.log('Mode: ' + mode);
        console.log('Seed: ' + seed);
        console.log('Max: ' + max);
        console.log('ID: ' + id);
        console.log('Name: ' + name);


        return (!(mode == '' || seed == '' || max == '' || id == '' || name == '')) && (max > 4) && (id > max);
    }

    function escapeHtml(string) {
        return String(string).replace(/[&<>"'`=\/]/g, function (s) {
            return entityMap[s];
        });
    }
    
    function renderCard(id) {
        role = gameArray(id);
        if (role == 'president' || role == 'president-teammate') {

        } else if (role == 'bomber' || role == 'bomber-teammate') {

        } else if (role == 'gambler') {

        }

    }
    
    function renderHelp() {
        
    }
        /*
    $('.card').on("taphold",function(){
         $(this).hide();
     });        */

    $('.card').on("taphold",function(){
        $(this).toggleClass('flipped');
    });

    $('.card').on('swipeleft',function(){
        if($(this).hasClass('flipped')) {
            $('.card .back p').animate({ marginLeft: "-100px", opacity: 0 }, 500);
        }
    });

    $('.card').on('swiperight',function(){
        if($(this).hasClass('flipped')) {
            $('.card .back p').animate({ marginLeft: "0", opacity: 1 }, 500);
        }
    });


    function toggleSwitch(elementOne, elementTwo) {
        toggle(elementOne);
        toggle(elementTwo);
    }
    function toggle(element) {
        if (element.hasClass('visible')) {
            hide(element);
        } else if (element.hasClass('hidden')) {
            show(element);
        }
    }

    function hide(element) {
        element.addClass('hidden');
        element.removeClass('visible');
    }

    function show(element) {
        element.addClass('visible');
        element.removeClass('hidden');
    }


});