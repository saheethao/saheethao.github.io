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

export class Strategy {
	
    constructor() {
        this.selfHistory = [];
        this.oppHistory = [];
        this.selfHistoryList = [];
        this.oppHistoryList = [];
        this.scoreList = [];
        this.score = 0;
		this.gameDataList = [];
		this.curGameData = null;
        this.stats = {};
        this.name = null;
        this.trueInit();
    }
    
    endGame() {
        this.selfHistoryList.push(this.selfHistory);
        this.oppHistoryList.push(this.oppHistory);
        this.scoreList.push(this.score);
		this.gameDataList.push(this.curGameData);
		this.curGameData = null;
    }
    
    trueInit() {
        this.selfHistory = [];
        this.oppHistory = [];
        this.score = 0;
        this.curGameData = new gameData.GameData(0);
        this.init();
    }
    
    init() {
        
    }
    
    trueReinit() {
        this.selfHistory = [];
        this.oppHistory = [];
        this.score = 0;
        this.curGameData = new gameData.GameData(0);
        this.curGameData.attr['scoreList'] = [0];
        this.reinit();
    }
    
    reinit() {
        
    }
    
    // data contains past moves of self and opponent
    update(data, oppName) {
        if (this.curGameData.oppName == null) {
            this.curGameData.oppName = oppName;
        }
        let d1 = data.selfMove;
        let d2 = data.oppMove;

        this.selfHistory.push(d1);
        this.oppHistory.push(d2);
        this.curGameData.selfMoves.push(d1);
        this.curGameData.oppMoves.push(d2);
        if (d1 == 0 && d2 == 0) {
            // Cooperate
            this.score += 3;
            this.curGameData.attr['selfScore'] += 3;
            this.curGameData.attr['oppScore'] += 3;

            this.curGameData.attr['r'] += 1;
        } else if (d1 == 1 && d2 == 0) {
            this.score += 5;
            this.curGameData.attr['selfScore'] += 5;
            this.curGameData.attr['oppScore'] += 0;

            this.curGameData.attr['t'] += 1;
        } else if (d1 == 1 && d2 == 1) {
            this.score += 1;
            this.curGameData.attr['selfScore'] += 1;
            this.curGameData.attr['oppScore'] += 1;

            this.curGameData.attr['p'] += 1;
        } else if (d1 == 0 && d2 == 1) {
            this.score += 0;
            this.curGameData.attr['selfScore'] += 0;
            this.curGameData.attr['oppScore'] += 5;

            this.curGameData.attr['s'] += 1;

        } else {
            console.log('ELSE!');
        }
        this.curGameData.attr['scoreList'].push(this.curGameData.attr['selfScore']);
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
    
    generateStats() {
        let dataKeys = ['r', 's', 't', 'p', 'selfScore', 'oppScore', 'win', 'tie', 'loss', 'difference', 'edge', 'node'];
        
        for (let i = 0; i < dataKeys.length; i++) {
            let dataKey = dataKeys[i];
            let abs = false;
            let indDataArr = this.getGamesData(dataKey, abs);
            this.stats[dataKey] = new Stat(indDataArr, dataKey);
        }
    }
    
    getGraph(size) {
        let getPermutations = function(list, maxLen) {
            // Copy initial values as arrays
            let perm = list.map(function(val) {
                return [val];
            });
            // Our permutation generator
            let generate = function(perm, maxLen, currLen) {
                // Reached desired length
                if (currLen === maxLen) {
                    return perm;
                }
                // For each existing permutation
                for (let i = 0, len = perm.length; i < len; i++) {
                    let currPerm = perm.shift();
                    // Create new permutation
                    for (let k = 0; k < list.length; k++) {
                        perm.push(currPerm.concat(list[k]));
                    }
                }
                // Recurse
                return generate(perm, maxLen, currLen + 1);
            };
            // Start with size 1 because of initial values
            return generate(perm, maxLen, 1);
        };
        let list = ['r', 's', 't', 'p'];
        let listPerm = getPermutations(list, size);
        let nodes = [{id: -1, label: 'Start'}];
        for (let i = 0; i < listPerm.length; i++) {
            let node = {id: i, label: listPerm[i].join('')};
            nodes.push(node);
        }
        let gameData = this.curGameData;
        if (this.gameDataList.length != 0) {
            gameData = this.gameDataList[this.gameDataList.length-1];
        }
         
        console.log('gameData');
        console.log(gameData);
        
        let edges = [];
        //  { from: 1, to: 3, arrows: "to" },
        let usedNodes = new Set();
        usedNodes.add(-1);
        let pastPos = -1;
        for (let i = size-1; i < gameData.selfMoves.length; i++) {            
            let mem = [];
            for (let j = size-1; j >= 0; j--) {
                mem.push(gameData.selfMoves[i-j]);
                mem.push(gameData.oppMoves[i-j]);
            }
            
                
            let binaryNum = mem.join('');
            let position = parseInt(binaryNum, 2);
            usedNodes.add(position);
            
            let found = false;
            for (let j = 0; j < edges.length; j++) {
                if (edges[j].from == pastPos && edges[j].to == position) {
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                edges.push({from: pastPos, to: position, arrows: 'to'});
            }
            
            pastPos = position;
        }
        
        usedNodes = Array.from(usedNodes);
        
        let newNodes = [];
        for (let i = 0; i < usedNodes.length; i++) {
            newNodes.push(nodes[usedNodes[i]+1]);
        }
        
        console.log(newNodes);
        console.log(edges);
        
        return [newNodes, edges];
    }
    
    getScoreList() {
        let gameData = this.curGameData;
        if (this.gameDataList.length != 0) {
            gameData = this.gameDataList[this.gameDataList.length-1];
        }
        return gameData.attr['scoreList'];
    }
    
    getGamePayoffs() {
        let gameData = this.curGameData;
        if (this.gameDataList.length != 0) {
            gameData = this.gameDataList[this.gameDataList.length-1];
        }
        return [gameData.attr['r'], gameData.attr['p'], gameData.attr['s'], gameData.attr['t']];
    }
    
    generateMove() {
        return 0;
    }
    
    getName() {
        return this.name;
    }
    
    getStrategy () {
        return null;
    }
    
}

export class EvolvedStrategy extends Strategy {
	
    constructor(genome, hist, name) {
        super();
        this.genome = genome;
        this.hist = hist;
        this.playHist = [];
        this.name = name;
    }
    
    init() {
        if (this.genome == null) {
            return;
        }
        this.playHist = [];
		for (let i = 0; i < this.hist.length; i++) {
			this.playHist.push(this.hist[i]);
		}
    }
    
    reinit() {
        this.playHist = [];
		for (let i = 0; i < this.hist.length; i++) {
			this.playHist.push(this.hist[i]);
		}
    }
    
    generateMove() {
        let oppMove = this.oppHistory[this.oppHistory.length - 1];
        let selfMove = this.selfHistory[this.selfHistory.length - 1];
        
        this.playHist.pop();
		this.playHist.pop();
		this.playHist.unshift(oppMove);
		this.playHist.unshift(selfMove);

        let binaryNum = this.playHist.join('');
		let position = parseInt(binaryNum, 2);
        return this.genome[position];
    }
    
    getName() {
        return this.name;
    }
    
    getCopy() {
        console.log('copy');
        return new EvolvedStrategy(this.genome, this.hist, this.name + ' (2)');
    }
    
}