$(function () {
    var max = -1;
    var id = -1;
    var name = '';
    var gameArray;

    var team = '';
    var role = '';

    var gambler = true;
    var docAndEngi = false;

    var coyBoy = 0;
    var shyGuy = 0;
    var spy = 0;

    var butlerAndMaid = false;
    var romAndJul = false;

    var intAndVict = false;
    var rivalAndSurv = false;

    var snipTarDec = false;

    var heroAndVill = false;

    var robot = 0;
    var clone = 0;





    $('#main .submit').click(function() {
        if (setUser()) {
            console.log('OK');
            var gameMax = max;
            gameArray = [];
            if (!gambler) {

            } else if (max % 2 == 1 || gambler) {
                console.log('pushing gambler...');
                gameArray.push("gambler");
                gameMax -= 1;
            }
            console.log('pushing president...');
            gameArray.push('president');
            gameMax -= 1;

            console.log('pushing bomber...');
            gameArray.push('bomber');
            gameMax -= 1;

            if (docAndEngi) {
                console.log('pushing Doc and Enji...');
                gameArray.push('doctor');
                gameMax -= 1;
                gameArray.push('engineer');
                gameMax -= 1;
            }

            if (coyBoy > 0) {
                for (var i = 0; i < coyBoy / 2; i += 1) {
                    console.log('pushing coyBoy...');
                    gameArray.push('coy-boy-bomber');
                    gameMax -= 1;
                    gameArray.push('coy-boy-president');
                    gameMax -= 1;
                }
            }

            if (shyGuy > 0) {
                for (var i = 0; i < shyGuy / 2; i += 1) {
                    console.log('pushing shyGuy...');
                    gameArray.push('shy-guy-bomber');
                    gameMax -= 1;
                    gameArray.push('shy-guy-president');
                    gameMax -= 1;
                }
            }

            if (spy > 0) {
                for (var i = 0; i < spy / 2; i += 1) {
                    console.log('pushing spy...');
                    gameArray.push('spy-bomber');
                    gameMax -= 1;
                    gameArray.push('spy-president');
                    gameMax -= 1;
                }
            }

            if (butlerAndMaid) {
                gameArray.push('butler');
                gameMax -= 1;
                gameArray.push('maid');
                gameMax -= 1;
            }

            if (romAndJul) {
                gameArray.push('romeo');
                gameMax -= 1;
                gameArray.push('juliet');
                gameMax -= 1;
            }

            if (intAndVict) {
                gameArray.push('intern');
                gameMax -= 1;
                gameArray.push('victim');
                gameMax -= 1;
            }

            if (rivalAndSurv) {
                gameArray.push('rival');
                gameMax -= 1;
                gameArray.push('survivor');
                gameMax -= 1;
            }

            if (snipTarDec) {
                gameArray.push('sniper');
                gameMax -= 1;
                gameArray.push('target');
                gameMax -= 1;
                gameArray.push('decoy');
                gameMax -= 1;
            }

            if (heroAndVill) {
                gameArray.push('hero');
                gameMax -= 1;
                gameArray.push('villain');
                gameMax -= 1;
            }

            if (clone > 0) {
                for (var i = 0; i < clone; i += 1) {
                    console.log('pushing clone...');
                    gameArray.push('clone');
                    gameMax -= 1;
                }
            }

            if (robot > 0) {
                for (var i = 0; i < robot; i += 1) {
                    console.log('pushing robot...');
                    gameArray.push('robot');
                    gameMax -= 1;
                }
            }

            for (var i = 0; i < gameMax / 2; i += 1) {
                gameArray.push('bomber-teammate');
            }

            for (var i = 0; i < gameMax / 2; i += 1) {
                gameArray.push('president-teammate');
            }

            console.log('Array: ' + gameArray);

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

        max = $('#max-input').val();
        id = $('#id-input').val();
        name = $('#name-input').val();


        id = parseInt(id);
        name = escapeHtml(name);

        console.log('Max: ' + max);
        console.log('ID: ' + id);
        console.log('Name: ' + name);

        if (!(mode || max  || id || name)) {
            console.log('There is at least one missing input');
            return false;
        } else {
            console.log('There are all inputs');
            if (id > max || max < 6) {
                console.log('Other error.')
            } else {
                return true;
            }
        }
    }

    function escapeHtml(string) {
        return String(string).replace(/[&<>"'`=\/]/g, function (s) {
            return entityMap[s];
        });
    }
    
    function renderCard(id) {
        role = gameArray[id];
        if (role == 'president' || role == 'president-teammate' || role == 'doctor'
            || role == 'coy-boy-president' || role == 'shy-guy-president' || role == 'spy-president'){
            team = 'president';
            $('#role-side').addClass('team-president');
            $('#team-h2').addClass('team-president');
            $('#team-h2').text('PRESIDENT');
            $('#show-role').addClass('team-president');
            $('#role-side img').attr("src", 'image/star.png');

            if ( role == 'spy-president') {
                $('#role-side').addClass('team-bomber');
                $('#team-h2').addClass('team-bomber');
                $('#team-h2').text('BOMBER');
                $('#show-role').addClass('team-bomber');
                $('#role-side img').attr("src", 'image/bomb.png');
            }

            if (role == 'president') {
                $('#role-p').text('The President');
            } else if (role == 'doctor') {
                $('#role-p').text('The Doctor');
            } else if (role == 'coy-boy-president') {
                $('#role-p').text('Coy Boy');
            } else if(role == 'shy-guy-president') {
                $('#role-p').text('Shy Guy');
            } else if(role == 'spy-president') {
                $('#role-p').text('Blue Spy');
            } else {
                $('#role-p').text('Teammate');
            }
        } else if (role == 'bomber' || role == 'bomber-teammate' || role == 'engineer'
            || role == 'coy-boy-bomber' || role == 'shy-guy-bomber' || role == 'spy-bomber') {
            team = 'bomber';
            $('#role-side').addClass('team-bomber');
            $('#team-h2').addClass('team-bomber');
            $('#team-h2').text('BOMBER');
            $('#show-role').addClass('team-bomber');
            $('#role-side img').attr("src", 'image/bomb.png');

            if ( role == 'spy-bomber') {
                $('#role-side').addClass('team-president');
                $('#team-h2').addClass('team-president');
                $('#team-h2').text('PRESIDENT');
                $('#show-role').addClass('team-president');
                $('#role-side img').attr("src", 'image/star.png');
            }

            if (role == 'bomber') {
                $('#role-p').text('The Bomber');
            } else if (role == 'engineer') {
                $('#role-p').text('The Engineer');
            } else if (role == 'coy-boy-bomber') {
                $('#role-p').text('Coy Boy');
            } else if(role == 'shy-guy-bomber') {
                $('#role-p').text('Shy Guy');
            } else if(role == 'spy-bomber') {
                $('#role-p').text('Red Spy');
            } else {
                $('#role-p').text('Teammate');
            }

        } else {
            team = 'neutral';
            $('#role-side').addClass('team-neutral');
            $('#team-h2').addClass('team-neutral')
            $('#team-h2').text('NEUTRAL');
            $('#show-role').addClass('team-neutral');
            $('#role-side img').attr("src", 'image/question.png');

            switch (role) {
                case 'gambler':
                    $('#role-p').text('The Gambler');
                    break;
                case 'butler':
                    $('#role-p').text('The Butler');
                    break;
                case 'maid':
                    $('#role-p').text('The Maid');
                    break;
                case 'romeo':
                    $('#role-p').text('Romeo');
                    break;
                case 'juliet':
                    $('#role-p').text('Juliet');
                    break;
                case 'intern':
                    $('#role-p').text('The Intern');
                    break;
                case 'victim':
                    $('#role-p').text('The Victim');
                    break;
                case 'rival':
                    $('#role-p').text('The Rival');
                    break;
                case 'survivor':
                    $('#role-p').text('The Survivor');
                    break;
                case 'sniper':
                    $('#role-p').text('The Sniper');
                    break;
                case 'target':
                    $('#role-p').text('The Target');
                    break;
                case 'decoy':
                    $('#role-p').text('The Decoy');
                    break;
                case 'hero':
                    $('#role-p').text('The Hero');
                    break;
                case 'villain':
                    $('#role-p').text('The Villain');
                    break;
                case 'robot':
                    $('#role-p').text('Robot');
                    break;
                case 'clone':
                    $('#role-p').text('Clone');
                    break;
            }
        }

        toggle($('#main'));
        toggle($('#role-side'));

    }
    
    function renderHelp() {
        toggle($('#help-menu'));
        $('#help-menu p').removeClass('active');
    }

    $("#overview-button").on('click', function () {
        hide($('#time-section'));
        hide($('#roles-section'));
        $('#help-menu p').removeClass('active');
        $(this).addClass('active');
        toggle($('#overview-section'));
    });
    $("#time-button").on('click', function () {
        hide($('#overview-section'));
        hide($('#roles-section'));
        $('#help-menu p').removeClass('active');
        $(this).addClass('active');
        toggle($('#time-section'));
    });
    $("#roles-button").on('click', function () {
        hide($('#overview-section'));
        hide($('#time-section'));
        $('#help-menu p').removeClass('active');
        $(this).addClass('active');
        toggle($('#roles-section'));
    });






    $("#hide-button").on('click', function () {
        toggle($('#hide'));
        toggle($('#show'));
    });

    $("#show-button").on('click', function () {
        toggle($('#hide'));
        toggle($('#show'));
    });

    $('#show-role').on('click', function () {
        console.log("LLL");
        toggle($('#role'));
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