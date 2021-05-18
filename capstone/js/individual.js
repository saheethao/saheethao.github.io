import * as gameData from './gameData.js';

/**
 * @class Holds the statistics for a set of data
 * @author Sahee Thao
 * @date 02/10/21
 *
 * @property {Array<number>} raw      - raw data the statistics are based on
 * @property {number}        max      - the max number in raw
 * @property {number}        min      - the min number in raw
 * @property {number}        range    - range of raw
 * @property {number}        midrange - midrange of raw
 * @property {number}        mean     - mean of raw
 * @property {number}        sum      - sum of raw
 * @property {number}        median   - median of raw
 * @property {number}        variance - variance of raw
 * @property {number}        std      - standard deviation of raw
 */
export class Stat {
	constructor(arr, dataKey) {
        this.dataKey = dataKey;
		this.attr = {};
        this.attr['raw'] = _.cloneDeep(arr);
		this.attr['raw'].sort(function(a,b){return a - b});
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
 * @class Archive holds each population in memory and each statistic about a population in memory
 *
 * @author Sahee Thao
 * @date 02/25/21
 *
 * @property {Array<Array<Individual>>}       pops      - each population was generated at generation i, where i is the index
 * @property {Array<AssoArray<String, Stat>>} popsStats - Each index i has an associative array of statistics at generation i
 */
export class Archive {
	/**
	 * @constructor Initializes pops and popsStats
     *
     * @date 03/05/2021
	 */
	constructor() {
		this.pops = {}; // Populations
        this.popsStats = {}; // Store stats of populations so they don't have to be recalculated
	}
	
	/**
	 * Add a copy of a population to pops. Adds an empty associative array to popsStats
     *
	 * @param {Array<Individual>} pop - the population to add a copy of to pops
	 *
     * @date 03/05/2021
	 */
	addPop(key, pop) {
		this.pops[key] = _.cloneDeep(pop);
		this.popsStats[key] = {};
	}
	
	/**
	 * Calculates and stores a certain statistic for a population and the individuals in that population
	 *
	 * @param popKey {*} - The key of the population
	 * @param statKey {*} - The statistic key
	 *
     * @date 02/25/21
	 */
	calculatePopDataStat(popKey, dataKey, abs=true) {
		// Get the population stats of a particular population popKey
		let popStats = this.popsStats[popKey];
		if (!(dataKey in popStats)) {
            // statKey has not yet been calculated
            
			// Create and store statistic
			
			// Get population of population from popKey
			let pop = this.pops[popKey];
			
			let popStatArr = [];
			
			// For each individual in population
			for (let i = 0; i < pop.length; i++) {
				let indDataArr = pop[i].getGamesData(dataKey, abs);

                // Add stat to the individual archive
				pop[i].archiveStats[dataKey] = new Stat(indDataArr, dataKey);

                // Add stat to the population archive
				popStatArr = popStatArr.concat(indDataArr);
			}
            let stat = new Stat(popStatArr, dataKey);
			this.popsStats[popKey][dataKey] = stat;
		} else {
            return popStats[dataKey];
        }
	}
}

/**
 * @class Individual holds genetic material of strategy and gameplay data. Also holds the payoffs for the game.
 * @author Sahee Thao
 * @date 02/12/20
 *
 * @requires GameData
 * @external lodash
 *
 * @property {Array<number>}              genome       - lookup table. Typically size 64. Contains only 0s and 1s
 * @property {Array<number>}              hist         - history bits. Typically size 6. Contains only 0s and 1s
 * @property {Array<number>}              playHist     - history bits used in play. Typically size 6. Contains only 0s and 1s
 * @property {Array<GameData>}            gameDataList - data of the gameplay
 * @property {GameData}                   curGameData  - data of the current game
 * @property {AssoArray<String, number>}  payoffs      - payoff number. Typically {'r':3,'s':0,'t':5,'p':1}
 * @property {AssoArray<String, boolean>} ready        - flags to see if individual is ready. Used with debugging
 *
 */
export class Individual {
    /**
     * @constructor
     * Properties are set by methods called by individual
     */
	constructor() {
		this.genome = null;
		this.hist = null;
		this.playhist = null;
		this.gameDataList = [];
		this.curGameData = null;
		this.payoffs = {};
		this.ready = {
			'setGenome': false,
			'setHist': false,
			'setPayoffs': false
		};
        this.fitness = null;
        this.archiveStats = {}; // used ONLY with archive as an archived individual
	}
	/**
	 * Creates a new GameData object and resets the play history to the original history.
     * Typically called when a game starts.
     *
     * @external gameData
     * @date 02/12/20
	 */
	gameInit() {
		this.curGameData = new gameData.GameData(this.genome.length);
		this.playHist = [];
		for (let i = 0; i < this.hist.length; i++) {
			this.playHist.push(this.hist[i]);
		}
	}
	
	/**
	 * Pushes the current GameData object on to the GameData list.
     * Typically called when a game ends.
     *
     * @date 12/31/20
	 */
	gameEnd() {
		this.gameDataList.push(this.curGameData);
		this.curGameData = null;
        this.fitness = null;
	}
	
	/**
	 * Updates the play history and current GameData givent the positions and decisions of the individuals
     *
     * @date 12/31/20
	 *
	 * @param {number}     pos1 - the position in the genome for this individual to get the move from
	 * @param {number}     d1   - the decision or move for this individual
	 * @param {number}     pos2 - the position in the genome for the opposing individual to get the move from
	 * @param {number}     d2   - the decision or move for the opposing individual
	 * @param {Individual} ind2 - the opposing individual
	 *
	 * @return nothing
	 */
	update(pos1, d1, pos2, d2, ind2) {
		let updatePayoff = null; // which payoff to increment
		let p1 = null; // payoff for this individual
		let p2 = null; // payoff for the opposing individual
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
	 * Get the array of a particular piece of data from each GameData in the GameData list
	 *
     * @date 12/31/20
     *
	 * @param {String}         dataKey - key to data value
     * @param {Boolean=true}   abs     - use absolute value
	 *
	 * @return {Array<number>} data    - Values of each GameData
	 */
	getGamesData(dataKey, abs=true) {
		let list = this.gameDataList;
		let data = [];
		for (let i = 0; i < list.length; i++) {
			data.push(list[i].getData(dataKey, abs));
		}
		return data;
	}
	
	/**
	 * Get the decision bit and decision depending on the current play history
     *
     * @date 12/31/20
	 * 
	 * @return [{number} {number}] - The position in the genome, the decision at that position
	 */
	getDecision() {
		let binaryNum = this.playHist.join('');
		let position = parseInt(binaryNum, 2);
		return [position, this.genome[position]];
	}
	
	/**
	 * Checks if the individual is ready to play.
     *
     * @date 12/31/20
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
	 * Sets genome using genome
     *
     * @date 12/31/20
     *
	 * @param {Array<number>} genome - The genome
	 */
	setGenome(genome) {
		this.ready['setGenome'] = true;
		this.genome = genome;
	}
	
	/**
	 * Sets the history using a module with the module args
     *
     * @date 12/31/20
     *
	 * @param {Array<number>} hist - the history bits
	 */
	setHist(hist) {
		this.ready['setHist'] = true;
		this.hist = hist;
	}
	
	/**
	 * Sets the payoffs
     *
     * @date 12/31/20
     *
	 * @param {number} r - the R payoff value
	 * @param {number} s - the S payoff value
	 * @param {number} t - the T payoff value
	 * @param {number} p - the P payoff value
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
     *
     * @date 12/31/20
     *
	 * @param {String} str - the corresponding key for a payoff
	 *
	 * @return {number} - the correspond value for payoff str
	 */
	getPayoff(str) {
		return this.payoffs[str];
	}
	
	/**
	 * Resets all GameData in gameDataList
     *
     * @date 12/31/20
	 */
	resetStats() {
		this.gameDataList = [];
		this.curGameData = null;
	}
	
	/**
	 * Make a deep clone of this Individual
	 *
     * @date 12/31/20
     *
     * @external lodash
     *
	 * @return {Individual} - A deep copy of this Individual
	 */
	clone() {
		return _.cloneDeep(this);
	}
}