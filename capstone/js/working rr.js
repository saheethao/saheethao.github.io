import * as Init from './modules/initialization.js';
import * as Mutate from './modules/mutate.js';
import * as Crossover from './modules/crossover.js';
import * as Objective from './modules/objective.js';
import * as Selection from './modules/selection.js';
import * as Partition from './modules/partition.js';
import * as Play from './modules/play.js';


window.main = main;

class GameStat {
	constructor(genome) {
		this.selfMoves = [];
		this.oppMoves = [];
		this.selfBitUse = [];
		for (let i = 0; i < genome.length; i++) {
			this.selfBitUse.push(0);
		}
		this.oppBitUse = [];
		for (let i = 0; i < genome.length; i++) {
			this.oppBitUse.push(0);
		}
		this.attr = {};
		this.attr['r'] = 0;
		this.attr['s'] = 0;
		this.attr['t'] = 0;
		this.attr['p'] = 0;
		this.attr['selfScore'] = 0;
		this.attr['oppScore'] = 0;
	}
	
}

class Individual {
	constructor() {
		this.genome = null;
		this.hist = null;
		this.playhist = null;
		this.gameStatList = [];
		this.curGameStat = null;
		this.attrDetailed = {};
		this.fitnessAttr = '';
		this.payoffs = {};
		this.ready = {
			'setGenome': false,
			'setHist': false,
			'setPayoffs': false
		};
	}
	
	gameInit() {
		this.curGameStat = new GameStat(this.genome);
		this.playHist = [];
		for (let i = 0; i < this.hist.length; i++) {
			this.playHist.push(this.hist[i]);
		}
	}
	
	gameEnd() {
		this.gameStatList.push(this.curGameStat);
		this.curGameStat = null;
	}
	
	update(pos1, d1, pos2, d2, ind2) {
		let updatePayoff = null;
		let p1 = null;
		let p2 = null;
		if (d1 == 0 && d2 == 0) {
			p1 = this.getPayoff('r');
			p2 = ind2.getPayoff('r');
			updatePayoff = 'r';
		} else if (d1 == 0 && d2 == 1) {
			p1 = this.getPayoff('s');
			p2 = ind2.getPayoff('t');
			updatePayoff = 's';
			this.curGameStat.attr['s'] += 1;
		} else if (d1 == 1 && d2 == 0) {
			p1 = this.getPayoff('t');
			p2 = ind2.getPayoff('s');
			updatePayoff = 't';
			this.curGameStat.attr['t'] += 1;
		} else if (d1 == 1 && d2 == 1) {
			p1 = this.getPayoff('p');
			p2 = ind2.getPayoff('p');
			updatePayoff = 'p';
		}
		
		/* Update Current Game Statistics */
		let gs = this.curGameStat;
		gs.attr[updatePayoff] += 1;
		gs.selfMoves.push(d1);
		gs.oppMoves.push(d2);
		gs.selfBitUse[pos1] += 1;
		gs.oppBitUse[pos2] += 1;
		gs.attr[updatePayoff] += 1;
		gs.attr['selfScore'] += p1;
		gs.attr['oppScore'] += p2;
		this.curGameStat = gs;
		
		/* Update Play History */
		this.playHist = [d1, d2].concat(this.playHist.slice(0, this.playHist.length - 2));
	}
	
	/* Get the decision bit and decision */
	getDecision() {
		let binaryNum = this.playHist.join('');
		let position = parseInt(binaryNum, 2);
		console.log(binaryNum);
		console.log(position);
		return [position, this.genome[position]];
	}
	
	/*
	 * Checks if the individual is ready to play
	 */
	isReady() {
		for (let key in this.ready) {
			if (ready[key] === false) {
				return false;
			}
		}
		return true;
	}
	
	/*
	 * Sets genome using a module with the module args
	 */
	setGenome(modName, args) {
		this.ready['setGenome'] = true;
		let initMan = new Init.ModuleManager();
		let mod = initMan.getModule(modName);
		this.genome = mod(args);
	}
	
	/*
	 * Sets the history using a module with the module args
	 */
	setHist(modName, args) {
		this.ready['setHist'] = true;
		let initMan = new Init.ModuleManager();
		let mod = initMan.getModule(modName);
		this.hist = mod(args);
	}
	
	/*
	 * Sets the payoffs
	 */
	setPayoffs(r, s, t, p) {
		this.ready['setPayoffs'] = true;
		this.payoffs['r'] = r;
		this.payoffs['s'] = s;
		this.payoffs['t'] = t;
		this.payoffs['p'] = p;
	}
	
	/*
	 * Get payoff r, s, t, or p
	 */
	getPayoff(str) {
		return this.payoffs[str];
	}
	
	/*
	 * Make a deep clone of this object
	 */
	clone() {
		return _.cloneDeep(this);
	}
}

/*
 * Append text at element '#console'
 */
function htmlprint(str) {
	$("#console").append(`<p>${str}</p>`);
}

/*
 * Main function
 */
function main() {
	let pop = [];
	
	for (let i = 0; i < 3; i++) {
		let ind = new Individual();
		ind.setGenome('pattern', [64, '1']);
		ind.setHist('pattern', [6, '1']);
		ind.setPayoffs(3, 0, 5, 1);
		htmlprint("*************************************************************************************");

		htmlprint("Individual " + i);
		htmlprint(ind.genome);
		htmlprint(ind.hist);
		pop.push(ind);
	}
	
	Play.roundRobin([pop, 150]);
	
	for (let i = 0; i < pop.length; i++) {
		let gameStats = pop[i].gameStatList;
		console.log(gameStats);
		let selfScore = 0;
		let oppScore = 0;
		for (let j = 0; j < gameStats.length; j++) {
			selfScore += gameStats[j].attr['selfScore'];
			oppScore += gameStats[j].attr['oppScore'];
		}
		htmlprint(`Total Self Score: ${selfScore}, Total Opp Score: ${oppScore}`);
	}
	
}

/*
 * Trigger main on clicking element '#test'
 */
$("#test").click(function(){
  main();
});
