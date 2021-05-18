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
    let pos = Math.round(Math.random() * states.length - 1);
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

function main() {
    let genome = [
			1,1,1,0,1,0,1,0,1,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,1,0,1,1,1];
    let hist = [0,1,1,0,1,1];
    
    let opp = new Opponenet(genome, hist);
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
    console.log(max);
    console.log(maxStates);
    console.log(maxInitials);
    
    let ind = sarsaToGA(maxStates, maxInitials);
    console.log(ind);
}














