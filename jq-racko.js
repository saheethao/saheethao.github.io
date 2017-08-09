$(document).ready(function() {

        var difficulty = 0;
        var numberSet = [];
        var playerSet = [];
        var cpuSet = [];
        var handNum = 0;
        var switchNum = 0;
        var deckSelected = false;
        var pileLeft = 0;
        var pileRight = 0;

        $(".big-button-main-menu").click(function () {
            $(this).fadeOut("slow");
            $("#diff").delay(800).fadeIn("slow");
        });

        $("#elise").click(function () {
            difficulty = 1;
            startGame();

        });

        $("#mary").click(function () {
            difficulty = 2;
            startGame();
        });

        $("#sahee").click(function () {
            difficulty = 3;
            startGame();
        });

        $("#player-hand").on({
            mouseenter: function () {
                //stuff to do on mouse enter
                $(this).addClass("shadow")
            },
            mouseleave: function () {
                //stuff to do on mouse leave
                $(this).removeClass("shadow")
            }
        }, ".card");

        $("#player-hand").on("click", ".card", function () {
            $(this).toggleClass("perm-shadow");
        });


        function startGame() {
            $("#diff").fadeOut();
            for (var i = 0; i < 100; i += 1) {
                numberSet.push(i + 1);
            }
            numberSet = shuffle(numberSet);
            console.log(numberSet);
            for (var i = 0; i < 20; i += 1) {
                playerSet.push(numberSet.pop());
                cpuSet.push(numberSet.pop());
            }
            console.log(playerSet);
            console.log(cpuSet);
            console.log(numberSet);
            renderPlayerCards();
            console.log("rendered cards");
            renderMarkers();
        }

        function shuffle(array) {
            var currentIndex = array.length, temporaryValue, randomIndex;

            // While there remain elements to shuffle...
            while (0 !== currentIndex) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        }

        function renderPlayerCards() {
            for (var i = 0; i < playerSet.length / 2; i += 1) {
                var card = "<div class='card'><span class='number'>" + playerSet[i]
                    + "</span></div>";
                $("#player-top").delay(800).append(card);
            }

            for (var i = playerSet.length / 2; i < playerSet.length; i += 1) {
                var card = "<div class='card'><span class='number'>" + playerSet[i]
                    + "</span></div>";
                $("#player-bottom").append(card);
            }
        }

        function renderMarkers() {
            $("#marker-top div").addClass("appear");
            $("#marker-bottom div").addClass("appear");
            $("#draw-space div").addClass("appear");

        }
    }
);