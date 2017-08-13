$(document).ready(function() {

    var difficulty = 0; //Sets difficulty
    var numberSet = []; //Set of numbers in the deck
    var playerSet = []; //Set of numbers the player has
    var cpuSet = []; //Set of numbers the computer has
    var finder = []; //Helps CPU find
    var handNum = 0; //The number selected by the player
    var switchNum = 0; //The number in the pile selected
    var deckSelected = false; //is the deck selected currently?
    var leftPileSelected = false; //is the left pile selected?
    var rightPileSelected = false; //is the right pile selected?

    var cardTotal = 100; //total number of cards
    var handTotal = 20; //cards per hand

    var handNumID = 0; //id of card switch


    var pileLeft = 0; //number on left pile
    var pileRight = 0; //number on right pile

    var hasSwapped = false;
    var hasDrawn = false;



    var isPlayersTurn = true;
    var sound1 = new Audio('sound/cursor1.ogg');
    var soundLow = new Audio('sound/cursor-low.wav');
    var soundVeryLow = new Audio('sound/cursor-very-low.wav');
    var soundHigh = new Audio('sound/cursor-high.wav');

    //Main menu
    $(".big-button-main-menu").click(function() {
        soundHigh.play();
        $(this).fadeOut("slow");
        $("#diff").delay(800).fadeIn("slow");
    });

    $("#elise").click(function() {
        difficulty = 1;
        levelOneSetup();
        startGame();

    });

    $("#mary").click(function() {
        difficulty = 2;
        startGame();
    });

    $("#sahee").click(function() {
        difficulty = 3;
        startGame();
    });


    //Hover effect when you hover on cards
    $("#player-hand").on({
        mouseenter: function() {
            //stuff to do on mouse enter
            $(this).addClass("shadow")
        },
        mouseleave: function() {
            //stuff to do on mouse leave
            $(this).removeClass("shadow")
        }
    }, ".card");

    $("#end-button").click(function() {
        console.log("Ending turn...");
        isPlayersTurn = false;
        startTurnCPU();
    });



    //Handles player interaction


    //Hand click
    $("#player-hand").on("click", ".card", function() {
        soundLow.play();
        console.log("User clicked on a card in the hand.");
        var cardNumber = $(this).text();
        console.log("The current hand number value is " + handNum + ".");
        console.log("The card number value is " + cardNumber + ".");

        if (deckSelected) { //deck is currently selected
            console.log("The deck was previously selected, but is now deselected.");
            deckSelected = false;
            $("#draw-space #deck").removeClass("perm-shadow"); //unselects deck
        } else if (leftPileSelected || rightPileSelected) {
            console.log("The left or right pile was previously selected.");

            console.log("Setting handNum and handNumID.");
            console.log("Deselecting card and selecting new card");
            handNum = cardNumber; //Set hand number to the card number
            handNumID = $(this).attr("id"); // get id

            $("#player-hand div").removeClass("perm-shadow"); //remove shadow from ALL cards
            $(this).addClass("perm-shadow"); //add shadow

            console.log("Now swapping...");
            //swap
            if(!hasSwapped) {
                swap(handNum, switchNum);
            }

            handNum = 0;
            leftPileSelected = false;
            rightPileSelected = false;
            $("#draw-space div").removeClass("perm-shadow");
            $("#player-hand .card").removeClass("perm-shadow");

        } else if (handNum == cardNumber) {
            console.log(handNum + " equals " + cardNumber + ".");
            console.log("Deselecting card.");
            handNum = 0; //hand number gets the value of 0 or nothing or "none selected"
            handNumID = 0;
            $(this).removeClass("perm-shadow"); //remove shadow
        } else { //case where handNum == 0 or handNum is a different number
            console.log(handNum + " does not equal " + cardNumber + ".");
            console.log("Deselecting card and selecting new card");
            handNum = cardNumber; //Set hand number to the card number
            handNumID = $(this).attr("id"); // get id

            $("#player-hand div").removeClass("perm-shadow"); //remove shadow from ALL cards
            $(this).addClass("perm-shadow"); //add shadow
        }

        console.log("leftPileSelected is " + leftPileSelected);
        console.log("rightPileSelected is " + rightPileSelected);
        console.log("handNum equals " + handNum);
        console.log("handNumID equals " + handNumID);
        console.log("deckSelected is " + deckSelected);
        console.log("The handNum value is now " + handNum + ".");
        console.log("Hand click function complete.");
        console.log("-----------------------------------------");
    });

    //-----------------------------------------------------


    //Deck click
    $("#draw-space").on("click", "#deck", function() {
        soundVeryLow.play();
        console.log("User clicked on the deck.");
        if (handNum != 0) { //a card is picked already, reset hand
            console.log("A card was previously selected, but is now deselected.");
            $("#player-hand div").removeClass("perm-shadow"); //removes shadow
            handNum = 0; //sets
        }

        if (leftPileSelected || rightPileSelected) {
            console.log("A pile was previously selected, but is now deselected.");
            $("#draw-space div").removeClass("perm-shadow");
            leftPileSelected = false;
            rightPileSelected = false;
        }
        console.log("Selecting the deck.");

        $(this).addClass("perm-shadow");
        deckSelected = true;


        console.log("leftPileSelected is " + leftPileSelected);
        console.log("rightPileSelected is " + rightPileSelected);
        console.log("handNum equals " + handNum);
        console.log("deckSelected is " + deckSelected);
        console.log("Deck click function complete.");
        console.log("-----------------------------------------");
    });



    //-----------------------------------------------------


    //Pile click
    $("#draw-space").on("click", ".pile", function() {
        soundHigh.play();
        //checks the pile clicked on
        var isLeftPile = $(this).attr("id") == "pile-left";
        if (isLeftPile) {
            console.log("Left pile currently selected");
        } else {
            console.log("Right pile currently selected");
        }
        //records value the pile holds
        switchNum = $(this).text();
        if (switchNum == "pile") {
            switchNum = 0; //if there is no number in the pile, set it to 0
        } else {
            switchNum = parseInt(switchNum);
        }


        if (handNum != 0) {
            console.log("A number was previously selected in the hand. Now swapping...");
            leftPileSelected = isLeftPile;
            rightPileSelected = !isLeftPile;
            if (!hasSwapped) {
                swap(handNum, switchNum);
            }
            handNum = 0;
            leftPileSelected = false;
            rightPileSelected = false;
            $("#draw-space div").removeClass("perm-shadow");
            $("#player-hand .card").removeClass("perm-shadow");

        } else if (deckSelected && !hasDrawn) { //if deck was selected
            hasDrawn = true;
            leftPileSelected = isLeftPile;
            rightPileSelected = !isLeftPile;
            //draw a card
            console.log("Deck was previously selected. Now drawing deck.")
            var pileNum = 0;
            //check to see if deck is empty
            if (numberSet[0] == null) {
                console.log("Deck is empty. Now reshuffleing.")
                pileNum = reshuffleCards();
            } else {
                console.log("Deck has cards still.");
            }
            //continue drawing a card
            console.log("Continuing drawing a card.")
            var cardDraw = numberSet.pop();
            console.log("Drawing card: " + cardDraw);
            if (rightPileSelected) {
                //if right pile was selected, remove last elemnt of numberSet and set it as right pile
                console.log("Right pile was selected. Now setting text...")
                $("#pile-right span").text(cardDraw);
            } else if (leftPileSelected) {
                //if right pile was selected, remove last elemnt of numberSet and set it as left pile
                console.log("Left pile was selected. Now setting text...")
                $("#pile-left span").text(cardDraw);
            }

            //if pileNum is a valid number, add it as the last element and shuffle the array
            if (pileNum != 0) {
                console.log("Adding left over pileNum.")
                numberSet.push(pileNum);
                numberSet = shuffle(numberSet);
            }

            console.log("Deselecting all.");
            //Deselect everything
            rightPileSelected = false;
            leftPileSelected = false;
            deckSelected = false;
            $("#draw-space div").removeClass("perm-shadow");
            console.log(numberSet);
        } else if (deckSelected && hasDrawn){
            console.log("Deselecting all.");
            //Deselect everything
            rightPileSelected = false;
            leftPileSelected = false;
            deckSelected = false;
            $("#draw-space div").removeClass("perm-shadow");
        } else {
            if (leftPileSelected || rightPileSelected) { //if left or right piles were selected
                if (leftPileSelected && isLeftPile) {
                    //Left was selected and left clicked

                    //Unselect all (left)
                    leftPileSelected = false;
                    $("#draw-space div").removeClass("perm-shadow");

                } else if (leftPileSelected && !isLeftPile) {
                    //Left was selected and right clicked

                    //Unselect left
                    leftPileSelected = false;
                    $("#draw-space div").removeClass("perm-shadow");

                    //Select right
                    rightPileSelected = true;
                    $("#pile-right").addClass("perm-shadow");

                } else if (rightPileSelected && !isLeftPile) {
                    //Right was selected and right clicked

                    //Unselect all (right)
                    rightPileSelectedPileSelected = false;
                    $("#draw-space div").removeClass("perm-shadow");

                } else if (rightPileSelected && isLeftPile) {
                    //Right was selected and left clicked

                    //Unselect right
                    rightPileSelected = false;
                    $("#draw-space div").removeClass("perm-shadow");

                    //select left
                    leftPileSelected = true;
                    $("#pile-left").addClass("perm-shadow");
                }
            } else if ( (!leftPileSelected) && (!rightPileSelected)) { //if none were both selected
                if (isLeftPile) {
                    //select left
                    leftPileSelected = true;
                    $("#pile-left").addClass("perm-shadow");
                } else {
                    //Select right
                    rightPileSelected = true;
                    $("#pile-right").addClass("perm-shadow");
                }
            }
        }
    });



    function startGame() {
        soundHigh.play();
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
        $("#end-turn").fadeIn();
    }

    function shuffle(array) {
        var currentIndex = array.length,
            temporaryValue, randomIndex;

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
            var card = "<div class='card' id='" + i + "'><span class='number'>" + playerSet[i] +
                "</span></div>";
            $("#player-top").delay(800).append(card);
        }

        for (var i = playerSet.length / 2; i < playerSet.length; i += 1) {
            var card = "<div class='card' id='" + i + "'><span class='number'>" + playerSet[i] +
                "</span></div>";
            $("#player-bottom").append(card);
        }
    }

    function renderMarkers() {
        $("#marker-top div").addClass("appear");
        $("#marker-bottom div").addClass("appear");
        $("#draw-space div").addClass("appear");
    }

    function reshuffleCards() {
        var pileNum = 0;
        console.log("The deck is empty.");

        //set up new array
        var newArray = [];
        for (var i = 0; i < cardTotal; i += 1) {
            newArray.push(i + 1); // 1 thru 100
        }

        console.log("newArray: " + newArray);

        //sets numbers from player set to zero
        for (var i = 0; i < playerSet.length; i += 1) {
            newArray[playerSet[i] - 1] = 0;
        }
        console.log("playerSet: " + playerSet);

        console.log("newArray: " + newArray);

        //sets numbers from cpu set to zero
        for (var i = 0; i < cpuSet.length; i += 1) {
            newArray[cpuSet[i] - 1] = 0;
        }

        console.log("cpuSet: " + cpuSet);
        console.log("newArray: " + newArray);

        //sets numbers from left and right piles to zero
        var leftNum = $("#pile-left").text();
        var rightNum = $("#pile-right").text();

        console.log("leftNum: " + leftNum);
        console.log("rightNum: " + rightNum);

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

        console.log("newArray: " + newArray);

        var newArray2 = [];
        for (var i = 0; i < newArray.length; i += 1) {
            if (newArray[i] != 0) {
                newArray2.push(newArray[i]);
            }
        }
        console.log("newArray: " + newArray);

        console.log("newArray2: " + newArray2);

        numberSet = shuffle(newArray2);
        console.log("numberSet: " + numberSet);
        console.log("pileNum: " + pileNum);
        return pileNum;
    }

    function swap(handNum, switchNum) {
        if (!(switchNum == 0)) {
            hasSwapped = true;
            console.log("Starting handNum: " + handNum + ".");
            console.log("Starting switchNum: " + switchNum + ".");
            var tempNum = switchNum;
            switchNum = handNum;
            handNum = tempNum;

            var string = "#player-hand #" + handNumID + " span";
            console.log(string);

            $(string).text(handNum);
            if (leftPileSelected) {
                $("#pile-left span").text(switchNum);
            } else if (rightPileSelected) {
                $("#pile-right span").text(switchNum);
            }
            console.log("Ending handNum: " + handNum + ".");
            console.log("Ending switchNum: " + switchNum + ".");
        }
        checkWin();
    }

    function checkWin() {
        var win = inOrder();

        if(win) {
            console.log("WIN!");
        }
    }

    function inOrder() {
        console.log("Checking order...")
        if (isPlayersTurn) {
            for (var i = 10; i < 19; i += 1) {
                var currentNum = $("#" + i + " span").text();
                currentNum = parseInt(currentNum);

                var nextNum = $("#" + (i+1) + " span").text();
                nextNum = parseInt(nextNum);

                if (nextNum < currentNum) {
                    console.log("Failure at " + i + ". " + nextNum + " < " + currentNum);
                    return false;
                } else {
                    console.log(i + ": " + nextNum + " > " + currentNum);
                }
            }
            var num19 = $("#19 span").text();
            num19 = parseInt(num19);

            var num0 = $("#0 span").text();
            num0 = parseInt(num0);

            if (num0 < num19) {
                console.log("Failure at " + i + ". " + num0 + " < " + num19);
                return false;
            } else {
                console.log(i + ": " + num0 + " > " + num19);
            }

            for (var i = 0; i < 9; i += 1) {
                var currentNum = $("#" + i + " span").text();
                currentNum = parseInt(currentNum);

                var nextNum = $("#" + (i+1) + " span").text();
                nextNum = parseInt(nextNum);

                if (nextNum < currentNum) {
                    console.log("Failure at " + i + ". " + nextNum + " < " + currentNum);
                    return false;
                } else {
                    console.log(i + ": " + num0 + " > " + num19);
                }
            }

            return true;

        } else {

        }
    }

    function levelOneSetup() {
        difficulty = 1;

        function searchIndex() {
            lowTarget = 0;
            hightTarget = 0;
            targetSuccess = false;
        };
        finder = [];
        for (var i = 0; i < 10; i += 1) {
            var index = new searchIndex();
            index.lowTarget = (i*5) + 1 + 50;
            index.hightTarget = index.lowTarget + 4;
            finder.push(index);
        }
        for (var i = 10; i < 20; i += 1) {
            var index = new searchIndex();
            index.lowTarget = (i*5) + 1 - 50;
            index.hightTarget = index.lowTarget + 4;
            finder.push(index);
        }
    }
    
    function startTurnCPU() {
        hasDrawn = false;
        hasSwapped = false;
        if (difficulty == 1) {
            levelOneCPU();
        }
    }
    
    function levelOneCPU() {
        //var cpuSet = []; //Set of numbers the computer has
        //var handNum = 0; //The number selected by the player
        //var switchNum = 0; //The number in the pile selected
        //finder[]
        //get pile data
        //sets numbers from left and right piles to zero
        var leftNum = $("#pile-left").text();
        var rightNum = $("#pile-right").text();

        console.log("leftNum: " + leftNum);
        console.log("rightNum: " + rightNum);

        if (leftNum != "pile") {
            leftNum = parseInt(leftNum);
        } else {
            leftNum = 0;
        }

        if (rightNum != "pile") {
            rightNum = parseInt(rightNum);
        } else {
            rightNum = 0;
        }

        //set success
        for (var i = 0; i < 20; i += 1) {
            var curNum = cpuSet[i];
            var low = finder[i].lowTarget;
            var high = finder[i].hightTarget;
            if (low <= curNum || curNum <= high) {
                finder[i].targetSuccess = true;
            }
        }

        for (var i = 0; i < 20; i += 1) {
            var low = finder[i].lowTarget;
            var high = finder[i].hightTarget;
            if ( (low <= leftNum || leftNum <= high) && !finder[i].targetSuccess) {
                finder[i].targetSuccess = true;
            }
        }


    }


});