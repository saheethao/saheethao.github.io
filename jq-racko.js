$(document).ready(function() {

        var difficulty = 0;
        var numberSet = [];
        var playerSet = [];
        var cpuSet = [];
        var handNum = 0;
        var switchNum = 0;
        var deckSelected = false;
        var leftPileSelected = false;
        var rightPileSelected = false;

        var cardTotal = 45;
        var handTotal = 20;

        var playerNum = 0;
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
            if (deckSelected) {
                $("#deck").removeClass("perm-shadow");
            }
            var cardNumber = $(this).text();
            if (cardNumber == playerNum) {
                playerNum = 0;
                $(this).removeClass("perm-shadow");
            } else {
                playerNum = cardNumber;
                $("#player-hand div").removeClass("perm-shadow");
                $(this).addClass("perm-shadow");
            }
            console.log("cardNumber equals " + cardNumber);
            console.log("playerNum equals " + playerNum);
        });

        $("#draw-space").on("click", "#deck", function () {
            if (playerNum != 0) { //a card is picked already, reset hand
                $("#player-hand div").removeClass("perm-shadow");
                playerNum = 0;
            }
            $(this).addClass("perm-shadow");
            deckSelected = true;
        });

    $("#draw-space").on("click", ".pile", function () {
        if ($(this).text() == "pile") {
            $("#player-hand div").removeClass("perm-shadow");
            playerNum = 0;
        }

        var id = $(this).attr("id");

        if (id == "pile-left") {
            leftPileSelected = true;
        } else if (id == "pile-right") {
            rightPileSelected = true;
        }

        if (deckSelected) { //draw a card

            var pileNum= 0;

            if (numberSet[0] == null) { //if deck is empty
                console.log("Deck is empty");
                //set up new array
                var newArray = [];
                for (var i = 0; i < cardTotal; i += 1) {
                    newArray.push(i + 1);
                }
                console.log("newArray:");
                console.log(newArray);

                //remove ones from player set to zero
                for (var i = 0; i < playerSet.length; i += 1) {
                    newArray[playerSet[i] - 1] = 0;
                }
                console.log("playerSet:");
                console.log(playerSet);

                console.log("newArray:");
                console.log(newArray);

                //remove ones from cpu set
                for (var i = 0; i < cpuSet.length; i += 1) {
                    newArray[cpuSet[i] - 1] = 0;
                }

                console.log("cpuSet:");
                console.log(cpuSet);

                console.log("newArray:");
                console.log(newArray);

                //remove left and right piles
                var leftNum = $("#pile-left").text();
                var rightNum = $("#pile-right").text();

                console.log("leftNum:");
                console.log(leftNum);

                console.log("rightNum:");
                console.log(rightNum);

                if (leftNum != "pile") {
                    newArray[leftNum - 1] = 0;
                }
                if (rightNum != "pile") {
                    newArray[rightNum - 1] = 0;
                }

                if (leftPileSelected) {
                    if (leftNum != "pile") {
                        pileNum = parseInt(leftNum);
                    }
                } else if (rightPileSelected) {
                    if (rightNum != "pile") {
                        pileNum = parseInt(rightNum);
                    }
                }

                console.log("newArray:");
                console.log(newArray);

                var newArray2 = [];
                for (var i = 0; i < newArray.length; i += 1) {
                    if (newArray[i] != 0) {
                        newArray2.push(newArray[i]);
                    }
                }
                console.log("newArray:");
                console.log(newArray);

                console.log("newArray2:");
                console.log(newArray2);

                numberSet = shuffle(newArray2);
            }
            //not empty

            if (rightPileSelected) {
                $("#pile-right span").text(numberSet.pop());
            } else if (leftPileSelected) {
                $("#pile-left span").text(numberSet.pop());
            }

            if (pileNum != 0) {
                numberSet.push(pileNum);
                numberSet = shuffle(numberSet);
            }

            rightPileSelected = false;
            leftPileSelected = false;

            deckSelected = false;
            $("#deck").removeClass("perm-shadow");
            console.log(numberSet);

        } else if (playerNum != 0) { //swap card with player

        }


    });



        function startGame() {
            $("#diff").fadeOut();
            for (var i = 0; i < cardTotal; i += 1) {
                numberSet.push(i + 1);
            }
            numberSet = shuffle(numberSet);
            console.log(numberSet);
            for (var i = 0; i < handTotal; i += 1) {
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