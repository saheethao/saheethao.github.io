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
	
	getStat(statStr, abs=true) {
		if (statStr == 'selfBitUse') {
			let use = _.cloneDeep(selfBitUse);
			use.sort();
			xy = [];
			for (let x = 0; x < use.length; x++) {
				xy.push([x,use[x]]);
			}
			let [m, c] = regression.linear(xy);
			if (abs) {
				return Math.asb(m);
			}
			return m;
		} else if (statStr == 'oppBitUse') {
			let use = _.cloneDeep(oppBitUse);
			use.sort();
			xy = [];
			for (let x = 0; x < use.length; x++) {
				xy.push([x,use[x]]);
			}
			let [m, c] = regression.linear(xy);
			if (abs) {
				return Math.asb(m);
			}
			return m;
		} else {
			return this.attr[statStr];
		}
	}
	
	
	
}

class Individual {
	constructor() {
		this.genome = null;
		this.hist = null;
		this.playhist = null;
		this.gameStatList = [];
		this.curGameStat = [];
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
		this.playHist.pop();
		this.playHist.pop();
		this.playHist.unshift(d2);
		this.playHist.unshift(d1);
	}
	
	getStatArr(statStr) {
		let list = this.gameStatList;
		let stat = [];
		for (let i = 0; i < list.length; i++) {
			stat.push(list[i].getStat(statStr));
		}
		return stat;
	}
	
	/* Get the decision bit and decision */
	getDecision() {
		let binaryNum = this.playHist.join('');
		let position = parseInt(binaryNum, 2);
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
	setGenome(mod, args) {
		this.ready['setGenome'] = true;
		this.genome = mod(args);
	}
	
	/*
	 * Sets the history using a module with the module args
	 */
	setHist(mod, args) {
		this.ready['setHist'] = true;
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
	
	resetStats() {
		this.gameStatList = [];
		this.curGameStat = null;
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
function htmlprint(htmlStr) {
	$("#console").append('<p>' + htmlStr + '</p>');
}

var selfScoreData = [];

function createBoxPlot(dataArray, name) {
	let box = {
		y: dataArray,
		type: 'box',
		name: name,
	};
	
	return box;
}

/*
 * Main function
 */
function main() {
	console.log('Start');
    let popSize = 100;
    let genLimit = 5;
    
	
	let r = 3;
	let s = 0;
	let t = 5;
	let p = 1;
	
	let modGenome = Init.random;
	let modGenomeArgs = [64];
    let modHist = Init.random;
	let modHistArgs = [6];
	
	let modParentSel = Selection.random;
	let modParentSelArgs = [null, 2];
	
	let modCrossover = Crossover.npoint;
	let modCrossoverArgs = [null, 2, 1, 1];
	
	let modMutate = Mutate.setFlip;
	let modMutateArgs = [null, 1, 1];
	
	let modObj = Objective.single;
	let modObjArgs = [null, 'selfScore']
	
	let modSel = Selection.best;
	let modSelArgs = [null, popSize, modObj, modObjArgs]
	
	let pop = [];

	/* Create initial population */
	for (let i = 0; i < popSize; i++) {
        let ind = new Individual();
        ind.setGenome(modGenome, modGenomeArgs);
        ind.setHist(modHist, modHistArgs);
        ind.setPayoffs(r, s, t, p);

        pop.push(ind);
    }

    for (let g = 0; g < genLimit; g++) {
        
		/* Prepare for evaluation */
		for (let i = 0; i < pop.length; i++) {
			pop[i].resetStats();
		}
		
        /* Evaluate */
		Play.roundRobin([pop, 150]);
		
		/* Sort */
		modSelArgs[0] = pop;
		let rest = null;
		[pop, rest] = modSel(modSelArgs);
		
		/* Grab top 5 */
		let genSelfScoreData = [];
		let topInds = pop.slice(0, 5);
		for (let i = 0; i < topInds.length; i++) {
			let data = topInds[i].getStatArr('selfScore');
			genSelfScoreData.push(createBoxPlot(data, `ind ${i}`));
		}
		/* Grab pop data */
		let popData = [];
		for (let i = 0; i < pop.length; i++) {
			let data = pop[i].getStatArr('selfScore');
			popData = popData.concat(data);
		}
		genSelfScoreData.push(createBoxPlot(popData, 'pop'));
		selfScoreData.push(genSelfScoreData);
		
		/* Create Offspring */

        let clones = []
        for (let i = 0; i < pop.length; i++) {
            let ind = pop[i].clone();
            clones.push(ind);
        }
		
		let arg0 = clones;
		let parents = null;
		let offspring = [];
		
		/* Crossover */
		//TODO: PARTITION
		while (arg0.length >= modParentSelArgs[1]) {
			modParentSelArgs[0] = arg0;
			[parents, arg0] = modParentSel(modParentSelArgs);
			modCrossoverArgs[0] = parents;
			let o = modCrossover(modCrossoverArgs);
			offspring = offspring.concat(o);
		}
		
		/* Mutation */
		//TODO: PARTITION
		modMutateArgs[0] = offspring;
		offspring = modMutate(modMutateArgs);
		
		/* Combine and Evaluate */
		pop = pop.concat(offspring);
		
		/* Prepare for evaluation */
		for (let i = 0; i < pop.length; i++) {
			pop[i].resetStats();
		}
		
        /* Evaluate */
        Play.roundRobin([pop, 150]);
		
		/* Select */
		//TODO: PARTITION
		modSelArgs[0] = pop;
		rest = null;
		[pop, rest] = modSel(modSelArgs);
		//htmlprint(`Generation ${g}`);
		$( "#console").trigger( "custom", [g] );

		console.log(g);
		//pop = _.shuffle(pop);
    }
	
	/* Prepare for evaluation */
	for (let i = 0; i < pop.length; i++) {
		pop[i].resetStats();
	}
		
    /* Evaluate */
	Play.roundRobin([pop, 150]);
		
	/* Sort */
	modSelArgs[0] = pop;
	let rest = null;
	[pop, rest] = modSel(modSelArgs);
	
	/* Grab top 5 */
	let genSelfScoreData = [];
	let topInds = pop.slice(0, 5);
	for (let i = 0; i < topInds.length; i++) {
		let data = topInds[i].getStatArr('selfScore');
		genSelfScoreData.push(createBoxPlot(data, `ind ${i}`));
	}
	/* Grab pop data */
	let popData = [];
	for (let i = 0; i < pop.length; i++) {
		let data = pop[i].getStatArr('selfScore');
		popData = popData.concat(data);
	}
	genSelfScoreData.push(createBoxPlot(popData, 'pop'));
	selfScoreData.push(genSelfScoreData);
}
var genPlot = 0;
var layout = {
	title: 'Self Score',
	range:[0,750],
};
function plot() {
	$('#gen-label').text(`Generation ${genPlot}`); 
	Plotly.newPlot('self-score-data', selfScoreData[genPlot], layout);
}


/*
 * Trigger main on clicking element '#test'
 */
$("#test").click(function(){
  main();
});

$("#plot").click(function(){
	plot();
});

$("#left-arrow").click(function(){
	if (genPlot == 0) {
		genPlot = selfScoreData.length - 1;
	} else {
		genPlot -= 1;
	}
	plot();
});

$("#right-arrow").click(function(){
	genPlot = (genPlot + 1) % selfScoreData.length;
	plot();
});

$( "#console" ).on( "custom", function( event, param1 ) {
	htmlprint(param1);
});