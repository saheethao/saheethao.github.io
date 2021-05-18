import * as Init from './modules/initialization.js';
import * as Mutate from './modules/mutate.js';
import * as Crossover from './modules/crossover.js';
import * as Objective from './modules/objective.js';
import * as Selection from './modules/selection.js';
import * as Partition from './modules/partition.js';
import * as Play from './modules/play.js';
//import * as Regression from '../regression.js';

/**
 * Holds the statistics for a set of data
 * The following properties are keys of attr
 * @property raw {Array<number>} - raw data the statistics are based on
 * @property max {number} - the max number in raw
 * @property min {number} - the min number in raw
 * @property range {number} - range of raw
 * @property midrange {number} - midrange of raw
 * @property mean {number} - mean of raw
 * @property sum {number} - sum of raw
 * @property median {number} - median of raw
 * @property variance {number} - variance of raw
 * @property std {number} - standard deviation of raw
 */
class Stat {
	constructor(arr) {
		this.attr = {};
		this.attr['raw'] = _.cloneDeep(arr);
		this.attr['raw'].sort();
		this.attr['max'] = this.attr['raw'][this.attr['raw'].length-1];
		this.attr['min'] = this.attr['raw'][0];
		this.attr['range'] = this.attr['max'] - this.attr['min'];
		this.attr['midrange'] = this.attr['range'] / 2;
		this.attr['mean'] = _.mean(this.attr['raw']);
		this.attr['sum'] = _.sum(this.attr['raw']);
		
		let mid = this.attr['raw'].length / 2;
		this.attr['median'] = mid % 1 ? this.attr['raw'][mid - 0.5] : (this.attr['raw'][mid - 1] + this.attr['raw'][mid]) / 2;
		
		let sum = 0;
		for (let i = 0; i < this.attr['raw'].length; i++) {
			sum += Math.pow((this.attr['raw'][i] - this.attr['mean']), 2);
		}
		this.attr['variance'] = sum / this.attr['raw'].length;
		this.attr['std'] = Math.sqrt(this.attr['variance']);
	}
	
	getAttr(statStr) {
		return this.attr[statStr];
	}
}
/**
 * Holds each population in memory and each statistic about a population in memory
 * @property pops {Array<Array<Individual>>} - Each population was generated at generation i, where i is the index
 * @property popsStats {Array<AssoArray<String, Stat>>} - Each index i has an associative array of statistics at generation i
 */
class Archive {
	/**
	 * Initializes pops and popsStats
	 */
	constructor() {
		this.pops = [];
		this.popsStats = []; // Store so stats don't have to be regathered and recalculated
	}
	
	/**
	 * Add a copy of a population to pops. Adds an empty associative array to popsStats
	 * @param pop {Array<Individual>} - The population to add a copy of to pops
	 *
	 */
	addPop(pop) {
		this.pops.push(_.cloneDeep(pop));
		this.popsStats.push([{}]);
	}
	
	/**
	 * Calculates and stores certain statistic for a population and the indiduals in that population.
	 *
	 * @param popId {number} - The generation of a population
	 * @param dataStr {String} - The statistic key
	 *
	 */
	calculateStat(popId, dataStr, abs=true) {
		/* Get the population stats of a particular generation popId */
		let popStats = this.popsStats[popId];
		if (!(dataStr in popStats)) {
			/* Create and store stat */
			console.log('Calculating ' + stat + '...');
			
			/* Get population of generation popId */
			let pop = this.pops[popId];
			
			/* Initialize the array used in the class Stat as param arr as population stat */
			let popStatArr = [];
			
			/* For each individual in population */
			for (let i = 0; i < pop.length; i++) {
				/* Initialize the array to make individual stat */
				let indStatArr = pop[i].getDataArr(dataStr, abs);				
				pop[i].archiveStats[dataStr] = new Stat(indStatArr);
			
				popStatArr.concat(indStatArr);
			}
			this.popsStats[popId][dataStr] = new Stat(popStatArr);
		}
	}

	/**
	 * Gets a population. It may be sorted in asc or desc order by an attribute
	 * @param popId {number} - The generation of a population
	 * @param dataStr {String=null} - The statistic
	 * @param asc {boolean=true} - Flag for ascending order
	 * @param abs {boolean=true} - not yet implemented
	 *
	 * @return {Array<Individual>} - sorted by dataStr in order asc
	 */
	 getPop(popId, dataStr=null, statStr='mean', asc=true, abs=true) {
		 let pop = this.pops[popId];
		 if (dataStr == null) {
			 return pop;
		 }
		 let sortedPop = _.cloneDeep(pop);
		 calculateStat(popId, dataStr, abs);
		 sortedPop.sort(function (a,b) {
			 if (asc) {
				return b.archiveStats[dataStr][statStr] - a.archiveStats[dataStr][statStr];
			 } else {
				return a.archiveStats[dataStr][statStr] - b.archiveStats[dataStr][statStr];
			 }
			
		 });
	 }
}

/**
 * Holds gameplay data. Represents gameplay from one match
 * @property selfMoves {Array<number>} - Holds an array of the moves played by this Individual
 * @property oppMoves {Array<number>} - Holds an array of the moves played by an opposing Individual
 * @property selfBitUse {Array<number>} - Holds am array of counts. Tracks how many times a bit was used by this Individual
 * @property oppBitUse {Array<number>} - Holds am array of counts. Tracks how many times a bit was used by an opposing Individual
 * @property attr {AssoArray<String, number>} - Holds the total of an attribute
 */
class GameData {
	
	/**
	 * @param size {number} - the size of the genome for parent Individual
	 */
	constructor(size) {
		this.selfMoves = [];
		this.oppMoves = [];
		this.selfBitUse = [];
		for (let i = 0; i < size; i++) {
			this.selfBitUse.push(0);
		}
		this.oppBitUse = [];
		for (let i = 0; i < size; i++) {
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
	
	/**
	 * This gets the data based on dataStr
	 * @param dataStr {String} - the key for attr or used as an indicator for what attribute to get
	 * @param abs {boolean=true} - used for 'selfBitUse' and 'oppBitUse' to absolute value the slope
	 *
	 * @return {number} - the value of requested attribute
	 */
	getData(dataStr, abs=true) {
		if (dataStr == 'selfBitUse') {
			/* Case Self Bit Use */
			let use = _.cloneDeep(this.selfBitUse);
			use.sort();
			let xy = [];
			for (let x = 0; x < use.length; x++) {
				xy.push([x,use[x]]);
			}
			let [m, b] = linearRegression(xy);
			if (abs) {
				return Math.abs(m);
			}
			return m;
		} else if (dataStr == 'oppBitUse') {
			/* Case Opponent Bit Use */
			let use = _.cloneDeep(oppBitUse);
			use.sort();
			let xy = [];
			for (let x = 0; x < use.length; x++) {
				xy.push([x,use[x]]);
			}
			let [m, b] = linearRegression(xy);
			if (abs) {
				return Math.abs(m);
			}
			return m;
		} else {
			/* Case a total in attr */
			return this.attr[dataStr];
		}
	}
}

/**
 * Holds genetic material of strategy and gameplay data. Also holds the payoffs for the game.
 *
 * @property genome {Array<number>} - Holds lookup table. Typically size 64. Contains only 0s and 1s
 * @property hist {Array<number>} - Holds history bits. typically size 6. Contains only 0s and 1s
 * @property playHist {Array<number>} - Holds history bits used in play. typically size 6. Contains only 0s and 1s
 * @property gameDataList {Array<GameData>} - Holds data of the gameplay
 * @property curGameData {GameData} - Holds data of the current game
 * @property payoffs {AssoArray<String, number>} - Holds payoff number.Typically {'r':3,'s':0,'t':5,'p':1}
 * @property ready {AssoArray<String, boolean>} - Holds flags to see if individual is ready. Used with debugging
 * @property archiveStats {AssoArray<String, Stat>} - Only used by the archive to recieve archive stats
 *
 */
class Individual {
	constructor() {
		this.genome = null;
		this.hist = null;
		this.playhist = null;
		this.gameDataList = [];
		this.curGameData = [];
		this.payoffs = {};
		this.ready = {
			'setGenome': false,
			'setHist': false,
			'setPayoffs': false
		};
		this.archiveStats = {};
	}
	/**
	* Called when a game starts. Creates a new GameData object and resets the play history to the original history
	*/
	gameInit() {
		this.curGameData = new GameData(this.genome.length);
		this.playHist = [];
		for (let i = 0; i < this.hist.length; i++) {
			this.playHist.push(this.hist[i]);
		}
	}
	
	/**
	 * Called when a game ends. Pushes the current GameData object on to the GameData list.
	 */
	gameEnd() {
		this.gameDataList.push(this.curGameData);
		this.curGameData = null;
	}
	
	/**
	 * Updates the play history and current GameData
	 *
	 * @param pos1 {number} - the position in the genome for this individual to get the move from
	 * @param d1 {number} - the decision or move for this individual
	 * @param pos2 {number} - the position in the genome for the opposing individual to get the move from
	 * @param d2 {number} - the decision or move for the opposing individual
	 * @param ind2 - the opposing individual
	 *
	 * @return nothing
	 */
	update(pos1, d1, pos2, d2, ind2) {
		let updatePayoff = null; // Which payoff to increment
		let p1 = null; // Payoff for this individual
		let p2 = null; // Payoff for the opposing individual
		if (d1 == 0 && d2 == 0) {
			/* Cooperate and cooperate */
			p1 = this.getPayoff('r');
			p2 = ind2.getPayoff('r');
			updatePayoff = 'r';
		} else if (d1 == 0 && d2 == 1) {
			/* Sucker and temptation */
			p1 = this.getPayoff('s');
			p2 = ind2.getPayoff('t');
			updatePayoff = 's';
			this.curGameData.attr['s'] += 1;
		} else if (d1 == 1 && d2 == 0) {
			/* Temptation and sucker */
			p1 = this.getPayoff('t');
			p2 = ind2.getPayoff('s');
			updatePayoff = 't';
			this.curGameData.attr['t'] += 1;
		} else if (d1 == 1 && d2 == 1) {
			/* Penalty and penalty */
			p1 = this.getPayoff('p');
			p2 = ind2.getPayoff('p');
			updatePayoff = 'p';
		}
		
		/* Update Current Game Data */
		let gd = this.curGameData;
		gd.attr[updatePayoff] += 1;
		gd.selfMoves.push(d1);
		gd.oppMoves.push(d2);
		gd.selfBitUse[pos1] += 1;
		gd.oppBitUse[pos2] += 1;
		gd.attr['selfScore'] += p1;
		gd.attr['oppScore'] += p2;
		this.curGameData = gd;
		
		/* Update Play History */
		this.playHist.pop();
		this.playHist.pop();
		this.playHist.unshift(d2);
		this.playHist.unshift(d1);
	}
	
	/**
	 * Get the array of data from each GameData in the GameData list
	 *
	 * @param dataStr {String} - Key to data value
	 *
	 * @return data {Array<number>} - Values of each GameData
	 */
	getDataArr(dataStr, abs=true) {
		let list = this.gameDataList;
		let data = [];
		for (let i = 0; i < list.length; i++) {
			data.push(list[i].getData(dataStr, abs));
		}
		return data;
	}
	
	/**
	 * Get the decision bit and decision
	 * 
	 * @return [{number} {number}] - The position in the genome, the decision at that position
	 */
	getDecision() {
		let binaryNum = this.playHist.join('');
		let position = parseInt(binaryNum, 2);
		return [position, this.genome[position]];
	}
	
	/**
	 * Checks if the individual is ready to play
	 *
	 * @return {boolean} - true if the individual is ready to play, false otherwise
	 */
	isReady() {
		for (let key in this.ready) {
			if (ready[key] === false) {
				return false;
			}
		}
		return true;
	}
	
	/**
	 * Sets genome using a module with the module args
	 * @param mod {function, Array<?>} - The function to use and its correpsonding arguements
	 */
	setGenome(mod, args) {
		this.ready['setGenome'] = true;
		this.genome = mod(args);
	}
	
	/**
	 * Sets the history using a module with the module args
	 * @param mod {function, Array<?>} - The function to use and its correpsonding arguements
	 */
	setHist(mod, args) {
		this.ready['setHist'] = true;
		this.hist = mod(args);
	}
	
	/**
	 * Sets the payoffs
	 * @param r {number} - The R payoff value
	 * @param s {number} - The S payoff value
	 * @param t {number} - The T payoff value
	 * @param p {number} - The P payoff value
	 */
	setPayoffs(r, s, t, p) {
		this.ready['setPayoffs'] = true;
		this.payoffs['r'] = r;
		this.payoffs['s'] = s;
		this.payoffs['t'] = t;
		this.payoffs['p'] = p;
	}
	
	/**
	 * Get payoff r, s, t, or p
	 * @param str {String} - The corresponding key for a payoff
	 *
	 * @return {number} - The correspond value for payoff str
	 */
	getPayoff(str) {
		return this.payoffs[str];
	}
	
	/**
	 * Resets all GameDatas
	 */
	resetStats() {
		this.gameDataList = [];
		this.curGameData = null;
	}
	
	/**
	 * Make a deep clone of this object
	 *
	 * @return {Individual} - A deep copy of this object
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
var rstpData = [];
var rData = [];
var sData = [];
var tData = [];
var pData = [];
var xData = [];

/**
 * Creates lineplot object
 * @param xArr {Array<number>}
 * @param yArr {Array<number>}
 * @param name {String}
 *
 * @return box {Plot}
 */
function createLinePlot(xArr, yArr, name) {
	let line = {
		x: _.clone(xArr),
		y: _.clone(yArr),
		name: name,
	};
	return line;
}

/**
 * Creates boxplot object
 * @param dataArray {Array<number>}
 * @param name {String}
 *
 * @return box {Plot}
 */
function createBoxPlot(dataArray, name) {
	let box = {
		y: _.clone(dataArray),
		type: 'box',
		name: name,
	};
	
	return box;
}

let popSize = 50;
let genLimit = 15;
    
	
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
let modMutateArgs = [null, 4, 1];
	
let modObj = Objective.single;
let modObjArgs = [null, 'selfScore', 'mean']
	
let modSel = Selection.worst;
let modSelArgs = [null, popSize, modObj, modObjArgs]

let pop = [];

let archive = new Archive();

/* Create initial population */
for (let i = 0; i < popSize; i++) {
	let ind = new Individual();
    ind.setGenome(modGenome, modGenomeArgs);
    ind.setHist(modHist, modHistArgs);
    ind.setPayoffs(r, s, t, p);

    pop.push(ind);
}

/**
 * Evolve a generation function. Updates global variable pop
 * @param g {Array<Individual>}
 * @return nothing
 */
function evolve(g) {
    console.log('Generation: ' + g);
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
        let data = topInds[i].getDataArr('selfScore');
        genSelfScoreData.push(createBoxPlot(data, `ind ${i}`));
    }
    /* Grab pop data */
    let popData = [];
    let rSum = 0;
    let sSum = 0;
    let tSum = 0;
    let pSum = 0;
    for (let i = 0; i < pop.length; i++) {
        let data = pop[i].getDataArr('selfScore');
        popData = popData.concat(data);
        rSum += _.sum(pop[i].getDataArr('r'));
        sSum += _.sum(pop[i].getDataArr('s'));
        tSum += _.sum(pop[i].getDataArr('t'));
        pSum += _.sum(pop[i].getDataArr('p'));
    }
    rData.push(rSum);
    sData.push(sSum);
    tData.push(tSum);
    pData.push(pSum);
    xData.push(g);
    rstpData.push([
        createLinePlot(xData, rData, 'R'),
        createLinePlot(xData, sData, 'S'),
        createLinePlot(xData, tData, 'T'),
        createLinePlot(xData, pData, 'P'),
    ]);
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
    //$('#console').html('Gen ' + g);
    genPlot = g;
    plot();
    g += 1;
    if (g < genLimit) {
        setTimeout(
            function() {
                $("#console").trigger("custom", [g]);
            }, 10);
    } else {
        /* Prepare for evaluation */
        for (let i = 0; i < pop.length; i++) {
            pop[i].resetStats();
        }

        /* Evaluate */
        Play.roundRobin([pop, 150]);
		archive.addPop(pop);
        /* Sort */
        modSelArgs[0] = pop;
        let rest = null;
        [pop, rest] = modSel(modSelArgs);

        /* Grab top 5 */
        let genSelfScoreData = [];
        let topInds = pop.slice(0, 5);
        for (let i = 0; i < topInds.length; i++) {
            let data = topInds[i].getDataArr('selfScore');
            genSelfScoreData.push(createBoxPlot(data, `ind ${i}`));
        }
        /* Grab pop data */
        let popData = [];
        let rSum = 0;
        let sSum = 0;
        let tSum = 0;
        let pSum = 0;
        for (let i = 0; i < pop.length; i++) {
            let data = pop[i].getDataArr('selfScore');
            popData = popData.concat(data);
            rSum += _.sum(pop[i].getDataArr('r'));
            sSum += _.sum(pop[i].getDataArr('s'));
            tSum += _.sum(pop[i].getDataArr('t'));
            pSum += _.sum(pop[i].getDataArr('p'));
        }
        rData.push(rSum);
        sData.push(sSum);
        tData.push(tSum);
        pData.push(pSum);
        xData.push(g);
        rstpData.push([
            createLinePlot(xData, rData, 'R'),
            createLinePlot(xData, sData, 'S'),
            createLinePlot(xData, tData, 'T'),
            createLinePlot(xData, pData, 'P'),
        ]);
        genSelfScoreData.push(createBoxPlot(popData, 'pop'));
        selfScoreData.push(genSelfScoreData);
    }
	console.log('pop:');
	console.log(pop);
    console.log('End');
}
var genPlot = 0;
var layout = {
	title: 'Self Score',
	range:[0,750],
};

/**
 * Plot the self-score and rstp data
 */
function plot() {
	$('#gen-label').text(`Generation ${genPlot}`); 
	Plotly.newPlot('self-score-data', selfScoreData[genPlot], layout);
	Plotly.newPlot('rstp', rstpData[genPlot], {title: 'RSTP'});
	console.log('rstpData:');
	console.log(rstpData);
}


/*
 * Trigger main on clicking element '#test'
 */
$("#test").click(function(){
	evolve(0);
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

/* On event 'custom' trigger evolve */
$( "#console" ).on("custom", function( event, g ) {
	evolve(g);
});

/**
 * Create linear regression from data
 *
 * @param data {Array<number>} - the data
 *
 * @return [{number} {number}] - [slope, y-intercept]
 */
function linearRegression(data) {
	let sumX = 0;
	let sumY = 0;
	let sumX2 = 0;
	let sumXY = 0;
	
	let yData = []
	
	for (let i = 0; i < data.length; i++) {
		yData.push(data[i][1]);
	}
	
	yData.sort();
	let n = yData.length;
	for (let i = 1; i <= n; i++) {
		sumX += i;
		sumX2 += i * i;
		sumY += yData[i];
		sumXY += yData[i] * i;
	}
	
	let m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
	let b = (sumY - m * sumX) / n;
	return [m, b];
}

/*
 * Guassian Probability Distribution
 * fitter.py
 * Identify your data's distribution
 * Regression JS
 * curve fitter
 * tensor flow
 * song chen
 */