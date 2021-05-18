export function roundRobin(args) {
	let pop = args[0];
	let rounds = args[1];
	for (let i = 0; i < pop.length - 1; i++) {
		for (let j = i + 1; j < pop.length; j++) {
			playNormal([pop[i], pop[j], rounds]);
		}
	}
}

function mod(n, m) {
  return ((n % m) + m) % m;
}
        
export function roundRobinGrid(args) {
	let pop = args[0];
	let rounds = args[1];
    let width = args[2];
    let alreadyPlayed = [];
	for (let i = 0; i < pop.length; i++) {
        let iX = i % width;
        let iY = Math.floor(i / width);
        let positions = [
            {x: mod(iX - 1, width), y: mod(iY - 1, width)}, // LU
            {x: iX    , y: mod(iY - 1, width)}, // U
            {x: mod(iX + 1, width), y: mod(iY - 1, width)}, // RU
            {x: mod(iX - 1, width), y: iY    }, // L
            {x: mod(iX + 1, width), y: iY    }, // R
            {x: mod(iX - 1, width), y: mod(iY + 1, width)}, // LD
            {x: iX    , y: iY + 1}, // D
            {x: mod(iX + 1, width), y: mod(iY + 1, width)}, // RD
        ];
        //i = x + width*y;
        
        
		for (let j = 0; j < positions.length; j++) {
            let player = pop[i];
            let oppIndex = (positions[j].x + width * positions[j].y) % pop.length;
            if (oppIndex <= i) {
                continue;
            }
            let opponent = pop[oppIndex];

            let args = [player, opponent, rounds];
			playNormal(args);
		}
	}
}

export function roundRobinGridOffspring(args) {
	let pop = args[0];
	let rounds = args[1];
    let width = args[2];
    let offspring = args[3];
    let alreadyPlayed = [];
	for (let i = 0; i < pop.length; i++) {
        let iX = i % width;
        let iY = Math.floor(i / width);
        let positions = [
            {x: mod(iX - 1, width), y: mod(iY - 1, width)}, // LU
            {x: iX    , y: mod(iY - 1, width)}, // U
            {x: mod(iX + 1, width), y: mod(iY - 1, width)}, // RU
            {x: mod(iX - 1, width), y: iY    }, // L
            {x: mod(iX + 1, width), y: iY    }, // R
            {x: mod(iX - 1, width), y: mod(iY + 1, width)}, // LD
            {x: iX    , y: iY + 1}, // D
            {x: mod(iX + 1, width), y: mod(iY + 1, width)}, // RD
        ];
        //i = x + width*y;
        //console.log(positions);
        
        
		for (let j = 0; j < positions.length; j++) {
            let player = pop[i];
            let oppIndex = (positions[j].x + width * positions[j].y) % pop.length;
            if (oppIndex <= i) {
                continue;
            }
            //console.log('parent ' + i + ' vs parent ' + oppIndex);
            let opponent = pop[oppIndex];
            
            let args = [player, opponent, rounds];
            // Parent plays parent
			playNormal(args);
            
            // Parent plays each child
            for (let c = 0; c < offspring[oppIndex].length; c++) {
                //console.log('parent ' + i + ' vs child ' + oppIndex + ' ' + c);
                opponent = offspring[oppIndex][c];
                args = [player, opponent, rounds];
                playNormal(args);
            }
            
            // Children plays each child
            for (let myC = 0; myC < offspring[i].length; myC++) {
                for (let c = 0; c < offspring[oppIndex].length; c++) {
                    player = offspring[i][myC];
                    //console.log('child ' + i + ' ' + myC + ' vs child ' + oppIndex + ' ' + c);
                    opponent = offspring[oppIndex][c];
                    args = [player, opponent, rounds];
                    playNormal(args);
                }
            }
            
            // Children plays parent
            for (let myC = 0; myC < offspring[i].length; myC++) {
                player = offspring[i][myC];
                opponent = pop[oppIndex];
                args = [player, opponent, rounds];
                playNormal(args);
            }
		}
        
        // Parent plays own children
        for (let c = 0; c < offspring[i].length; c++) {
            //console.log('parent ' + i + ' vs own child ' + c);
            let player = pop[i];
            let opponent = offspring[i][c];
            args = [player, opponent, rounds];
            playNormal(args);
        }
	}
    console.log('post play');
    console.log(pop);
}



/*
 * args: ind1, ind2, rounds
 */
function playNormal(args) {
	let ind1 = args[0];
	let ind2 = args[1];
	let rounds = args[2];
	
	ind1.gameInit();
	ind2.gameInit();
	
	for (let i = 0; i < rounds; i++) {
		playRound(ind1, ind2);
	}
	
	ind1.gameEnd();
	ind2.gameEnd();
}

/*
 * args: ind1, ind2, rounds, chance
 */
function playNoisey(args) {
	let ind1 = args[0];
	let ind2 = args[1];
	let rounds = args[2];
	let chance = args[3];
	
	ind1.gameInit();
	ind2.gameInit();
	
	for (let i = 0; i < rounds; i++) {
		playRoundNoisy(ind1, ind2, chance);
	}
	
	ind1.gameEnd();
	ind2.gameEnd();
}

/*
 * Play a single round
 */
function playRound(ind1, ind2) {
	let [pos1, d1] = ind1.getDecision();
	let [pos2, d2] = ind2.getDecision();
	
	ind1.update(pos1, d1, pos2, d2, ind2);
	ind2.update(pos2, d2, pos1, d1, ind1);
}

/*
 * Play a single (noisy) round
 */
function playRoundNoisy(ind1, ind2, chance) {
	let [pos1, d1] = ind1.getDecision();
	let [pos2, d2] = ind2.getDecision();
	if (chance < Math.random()) {
		d1 = d1^1;
	}
	
	if (chance < Math.random()) {
		d2 = d2^1;
	}
	ind1.update(pos1, d1, pos2, d2, ind2);
	ind2.update(pos2, d2, pos1, d1, ind1);
}





