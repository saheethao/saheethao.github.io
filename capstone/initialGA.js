/**
 Current
13
As a User, I can use an evolutionary algorithm to evolve solutions to the iterated prisoner’s dilemma
Costs more than I would normally cost it because I would like to plan it more since other stories rely on this story, make it maintainable and modular, already have a good start

2
As a User, I can change the operators of the evolutionary algorithm, such as the crossover operator

1
As a User, I can adjust the parameters to tune the algorithm, such as the mutation rate




*/
/**
 * Generate 1 or 0
 */
function randomBit() {
	return Math.round(Math.random());
}

/* Shuffle using fisher yates method */
function shuffle(array) {
  let i = array.length;
  while (i--) {
    const ri = Math.floor(Math.random() * (i + 1));
    [array[i], array[ri]] = [array[ri], array[i]];
  }
  return array;
}

class Individual {
	/*
	 * Constructor
	 */
	constructor(genome, hist) {
		/* Scores */
		this.scoreTotal = 0; // Total score from all games
		this.score = 0; // Total scrore from all rounds from a game
        if (genome == null) {
            this.genome = []; // Genome
            /* Initialize randome genome and set decisions positions to 0 */
            for (var i = 0; i < 64; i++) {
                this.genome.push([randomBit()]);
            }
        } else {
            this.genome = _.cloneDeep(genome);
        }
		if (hist == null) {
            this.histOriginal = []; // Original history bits
            this.hist = []; // Current history bits
            /* Initialize history and original history */
            for (var i = 0; i < 6; i++) {
                this.hist.push(randomBit());
                this.histOriginal.push(this.hist[i]);
            }
        } else {
            this.hist = _.cloneDeep(hist);
            this.histOriginal = _.cloneDeep(hist);
        }
        
		
	}
	
	/*
	 * Get decision
	 */
	getDecision() {
		/* Convert history to position (which has the decision in genome) */
		const histStr = this.hist.join('');
		const pos = parseInt(histStr, 2);
		
		const decision = this.genome[pos];
		
		return decision;
	}
	
	/*
	 * Update history based on played decisions
	 */
	update(d1, d2) {
		/* Removes 1st and 2nd element */
		this.hist.shift();
		this.hist.shift();
		
		/* Appends elements to end of list */
		this.hist.push(d1);
		this.hist.push(d2);
		
		/* Update score */
		if (d1 == 0) {
			// C
			if (d2 == 0) {
				// CC
				this.score += 3;
			} else {
				// CD
				this.score += 0;
			}
		} else {
			// D
			if (d2 == 0) {
				// DC
				this.score += 5;
			} else {
				// DD
				this.score += 1;
			}
		}
	}
	
	/*
	 * What to do at the end of a game (reset)
	 */
	endGame() {
		/* Update score total */
		this.scoreTotal += this.score;
		
		/* Reset score */
		this.score = 0;
		
		/* Reset history */
		for (var i = 0, len = this.hist.length; i < len; i++) {
			this.hist[i] = this.histOriginal[i];
		}
	}
	
	genomeStr() {
		var str = "";
		for (var i = 0, len = this.genome.length; i < len; i++) {
			str = str + this.genome[i] + " ";
		}
		return str;
	}
}

/*
 * Play a single round
 */
function playRound(ind1, ind2) {
	const d1 = ind1.getDecision();
	const d2 = ind2.getDecision();
	
	ind1.update(d1, d2);
	ind2.update(d2, d1);
}

/*
 * Play a game (150 rounds)
 */
function play(ind1, ind2) {
	for (var i = 0; i < 150; i++) {
		playRound(ind1, ind2);
	}
	ind1.endGame();
	ind2.endGame();
}

/*
 * Given a population, evaluate them in a round robin tournament
 */
function evaluate(p) {
	/* Ensure score is 0 (probably not needed) */
	for (var i = 0, len = p.length; i < len; i++) {
		p[i].score = 0;
	}
	
	/* Each individual plays one another once */
	for (var i = 0, len = p.length; i < len; i++) {
		for (var j = i + 1; j < len; j++) {
			play(p[i], p[j]);
		}
	}
}

function crossover(ind1, ind2) {
	let g1 = ind1.genome;
	let g2 = ind2.genome;
	
	let size = Math.min(g1.length, g2.length);
    let cxpoint = Math.floor(Math.random() * (size + 1));
	
	let g1half = g1.splice(cxpoint + 1, g1.length - (cxpoint + 1) );
	let g2half = g2.splice(cxpoint + 1, g2.length - (cxpoint + 1) );
	g1 = _.concat(g1, g2half);
	g2 = _.concat(g2, g1half);
	
	ind1.genome = g1;
	ind2.genome = g2;
}

function mutate(ind, pb) {
	for (var i = 0, len = ind.genome.length; i < len; i++) {
		if (Math.random() < pb) {
			console.log(i);
			if (ind.genome[i] == 1) {
				ind.genome[i] = 0;
			} else {
				ind.genome[i] = 1;
			}
		}
	}
}

/*
 * Main function for the GA
 */
function main() {
	const CX_PB = 0.7;
	var pop = [];
	for (var i = 0; i < 20; i++) {
		pop.push(new Individual(null, null));
	}
	
	const NUM_GEN = 50;
	for (var gen = 0; gen < NUM_GEN; gen += 1) {
		
		/* Create offspring through crossover and mutation */
		var off = _.cloneDeep(pop);
		for (var i = 0; i < off.length; i += 2) {
            crossover(off[i], off[i+1]);
		}
		for (var i = 0; i < off.length; i++) {
			mutate(off[i]);
		}
		
		/* Add offspring to pop */
		pop = _.concat(pop, off);
		
		/* Evaluate pop (by playing game) */
		evaluate(pop);
		
		/* Sort by scoreTotal */
		pop.sort( (a,b) => b.scoreTotal - a.scoreTotal );
		
		/* Grab best for next generation (first 50) */
		pop = pop.slice(0, 50);
        console.log("POP");
        console.log(pop);

		for (var i = 0; i < off.length; i++) {
			pop[i].scoreTotal = 0;
		}
        if (gen % 2 == 0 && gen != 0) {
            let immigrant = sarsaImmigrant(pop[0]);
            let newInd = new Individual(immigrant[0], immigrant[1]);
            pop.push(newInd);
            let newIndMut = _.cloneDeep(newInd);
            mutate(newIndMut);
            pop.push(newIndMut);
            console.log("After adding immigrant: " + pop.length);
        }
        pop = shuffle(pop);

		console.log("Completed gen " + gen)
	}
	
	evaluate(pop)
	pop.sort( (a,b) => b.scoreTotal - a.scoreTotal )
	for (var i = 0, len = 10; i < len; i++) {
		console.log("Total Score: " + pop[i].scoreTotal)
		//console.log(pop[i].genomeStr())
		console.log("Genome:  " + JSON.stringify(pop[i].genome))
		console.log("History: " + JSON.stringify(pop[i].histOriginal))
	}
	
}

class AgentR {
    constructor(isQ) {
        this.isQ = isQ;
        this.playHist = [];
        this.states = [];
    }
    
    learn(initialState, epsilonDecay, alphaDecay, episodeLimit, opponent) {
        let epsilon = 0.9;
        let alpha = 0.9;
        let curState = initialState;
        this.states = [];
        for (let i = 0; i < 64; i++) {
            this.states.push([0, 0]);
        }
        let scores = [];
        
        for (let episode = 0; episode < episodeLimit; episode++) {
            opponent.reinit();
            let curStatePos = this.stateToPos(curState);
            let action = this.getAction(epsilon, curStatePos);
            let totalR = 0;
            let totalOppR = 0;
            for (let round = 0; round < 150; round++) {
                let oppAction = opponent.getAction();
                opponent.updateHist(oppAction, action);
                let statePrime = [curState[2], curState[3], curState[4], curState[5], action, oppAction];
                let statePrimePos = this.stateToPos(statePrime);
                let actionPrime = this.getAction(epsilon, statePrimePos);
                let r = this.getR(action, oppAction);
                totalR += r;
                let oppR = this.getR(oppAction, action);
                totalOppR += oppR;
                if (episode == episodeLimit - 1) {
                    //console.log("Round " + round + ": " + r + " " + oppR);
                    //console.log("opp history bits: " + opponent.hist);
                }
                let q = this.states[curStatePos];
                let qPrime = this.states[statePrimePos];
                q[action] = q[action] + alpha * (r + 0.9 * qPrime[actionPrime] - q[action]);
                curStatePos = statePrimePos;
                action = actionPrime;
            }
            if (episode % epsilonDecay == 0 && episode != 0) {
                epsilon = this.decay(epsilon, epsilonDecay, episode);
            }
            if (episode % alphaDecay == 0 && episode != 0) {
                alpha = this.decay(alpha, alphaDecay, episode);
            }
            if (episode >= episodeLimit - 10) {
                scores.push([totalR, totalOppR]);
            }
        }
        console.log("Evaluation");
        opponent.reinit();
        let curStatePos = this.stateToPos(curState);
        let action = this.getAction(0, curStatePos);
        let totalR = 0;
        let totalOppR = 0;
        for (let round = 0; round < 150; round++) {
            //console.log("--- Round " + round + " ---");
            //console.log("Current State:   " + curState);
            //console.log("Current History: " + opponent.hist);
            let oppAction = opponent.getAction();
            opponent.updateHist(oppAction, action);
            
            //console.log("RL Action:   " + action);
            //console.log("GA Decision: " + oppAction);
            let statePrime = [curState[2], curState[3], curState[4], curState[5], action, oppAction];
            let statePrimePos = this.stateToPos(statePrime);
            let actionPrime = this.getAction(0, statePrimePos);
            let r = this.getR(action, oppAction);
            totalR += r;
            let oppR = this.getR(oppAction, action);
            totalOppR += oppR;
            let q = this.states[curStatePos];
            let qPrime = this.states[statePrimePos];
            q[action] = q[action] + alpha * (r + 0.9 * qPrime[actionPrime] - q[action]);
            curStatePos = statePrimePos;
            action = actionPrime;
        }
        console.log("initial: " + initialState);
        console.log("Score: " + totalR + "-" + totalOppR);
        scores.push([totalR, totalOppR]);
        return [this.states, scores];
    }
    
    decay(param, paramDecay, episode) {
        return 0.9 / (1 + (episode/paramDecay));
    }
    
    getR(action, oppAction) {
        if (action == 0) {
            if (oppAction == 0) {
                return 3;
            } else {
                return 0;
            }
        } else {
            if (oppAction == 0) {
                return 5;
            } else {
                return 1;
            }
        }
    }
    
    /**
	 * Get the state position and action
	 * 
	 * @return [{number} {number}] - The position in the genome, the decision at that position
	 */
	getAction(epsilon, curStatePos) {
		let q = this.states[curStatePos];
        
        let action = null;
        if (Math.random() < epsilon) {
            action = Math.round(Math.random());
        } else {
            action = 0;
            if (q[1] > q[0]) {
                action = 1;
            }
        }
		return action;
	}
    
    stateToPos(state) {
        let binaryNum = state.join('');
		let position = parseInt(binaryNum, 2);
        return position;
    }
}


class Opponenet {
    constructor(genome, hist) {
        this.genome = genome;
        this.originalHist = hist;
        this.hist = hist;
    }
    
    getAction() {
        let binaryNum = this.hist.join('');
		let position = parseInt(binaryNum, 2);
        return this.genome[position];
    }
    
    updateHist(selfBit, oppBit) {
        let newHist = [this.hist[2], this.hist[3], this.hist[4], this.hist[5], selfBit, oppBit];
        this.hist = newHist;
    }
    
    reinit() {
        for (let i = 0; i < this.originalHist.length; i++) {
            this.hist[i] = this.originalHist[i];
        }
    }
}

function sarsaToGA(states, initials) {
    console.log(states);
    console.log(initials);
    let pos = Math.round(Math.random() * (states.length - 1));
    console.log("pos: " + pos);
    let state = states[pos];
    let hist = initials[pos];
    let genome = [];
    for (let i = 0; i < state.length; i++) {
        if (state[0] == state[1]) {
            genome.push(Math.round(Math.random()));
        } else if (state[0] > state[1]) {
            genome.push(0);
        } else {
            genome.push(1);
        }
    }
    return [genome, hist];
}

function sarsaImmigrant(bestInd) {
    let genome = [
			1,1,1,0,1,0,1,0,1,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,1,0,1,1,1];
    let hist = [0,1,1,0,1,1];
    
    let opp = new Opponenet(bestInd.genome, bestInd.histOriginal);
    let agent = new AgentR(false);
    let max = 0;
    let maxStates = [];
    let maxInitials = [];
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            for (let k = 0; k < 2; k++) {
                for (let l = 0; l < 2; l++) {
                   for (let m = 0; m < 2; m++) {
                        for (let = n = 0; n < 2; n++) {
                            let initial = [i, j, k, l, m, n];
                            let result = agent.learn(initial, 200, 20, 20, opp);
                            let finalScore = result[1][result[1].length - 1][0];
                            if (finalScore == max) {
                                maxStates.push(result[0]);
                                maxInitials.push(initial);
                            } else if (finalScore > max) {
                                maxStates = [];
                                maxInitials = [];
                                max = finalScore;
                                maxStates.push(result[0]);
                                maxInitials.push(initial);
                            }
                        }
                    } 
                }
            }
        }
    }
    //console.log("max: " + max);
    //console.log("maxStates: " + maxStates);
    //console.log("maxInitial: " + maxInitials);
    
    console.log("Number of max states: " + maxStates.length);
    let ind = sarsaToGA(maxStates, maxInitials);
    console.log("Immigrant:" + ind[0] + "+" + ind[1]);
    return ind;
}














