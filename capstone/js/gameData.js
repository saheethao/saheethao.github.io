/**
 * @class GameData holds gameplay data. Represents gameplay from one game between two individuals
 *
 * @author Sahee Thao
 * @version 1.0.0
 * @date 12/31/20
 *
 * @property {Array<number>}             selfMoves  - an array of the moves played by this Individual
 * @property {Array<number>}             oppMoves   - an array of the moves played by an opposing Individual
 * @property {Array<number>}             selfBitUse - an array of counts. Tracks how many times a bit was used by this Individual
 * @property {Array<number>}             oppBitUse  - an array of counts. Tracks how many times a bit was used by an opposing Individual
 * @property {AssoArray<String, number>} attr       - the total of an attribute
 */
export class GameData {
	
	/**
     * @constructor uses size for bit use data
     *
     * @date 12/31/20
     *
	 * @param size {number} - the size of the genome for parent Individual
	 */
	constructor(size, oppName=null) {
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
        this.oppName = oppName;
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
        
        let edges = [];
        //  { from: 1, to: 3, arrows: "to" },
        let usedNodes = new Set();
        usedNodes.add(-1);
        let pastPos = -1;
        for (let i = size-1; i < this.selfMoves.length; i++) {            
            let mem = [];
            for (let j = size-1; j >= 0; j--) {
                mem.push(this.selfMoves[i-j]);
                mem.push(this.oppMoves[i-j]);
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
        
        return [newNodes, edges];
    }
	
	/**
	 * This gets the data based on dataKey
     *
     * @date 12/31/20
     *
	 * @param {String}       dataKey - the key for attr or used as an indicator for what attribute to get
	 * @param {boolean=true} abs     - used for 'selfBitUse' and 'oppBitUse' to absolute value the slope
	 *
	 * @return {number} - the value of requested attribute
	 */
	getData(dataKey, abs=true) {
		if (dataKey == 'selfBitUse') {
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
		} else if (dataKey == 'oppBitUse') {
			/* Case Opponent Bit Use */
			let use = _.cloneDeep(this.oppBitUse);
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
		} else if (dataKey == 'win') {
            if (this.attr['selfScore'] > this.attr['oppScore']) {
                return 1;
            } else {
                return 0;
            }
        } else if (dataKey == 'tie') {
            if (this.attr['selfScore'] == this.attr['oppScore']) {
                return 1;
            } else {
                return 0;
            }
        } else if (dataKey == 'loss') {
            if (this.attr['selfScore'] < this.attr['oppScore']) {
                return 1;
            } else {
                return 0;
            }
        } else if (dataKey == 'difference') {
            return this.attr['selfScore'] - this.attr['oppScore'];
        }  else if (dataKey == 'edge') {
            return this.getGraph(3)[1].length;
        } else if (dataKey == 'node') {
            return this.getGraph(3)[0].length;
        } else {
			/* Case a attribute in attr */
			return this.attr[dataKey];
		}
	}
}

/**
 * Create linear regression from data
 *
 * @param {Array<number>} data - the data
 *
 * @return [{number} {number}] [slope, y-intercept]
 */
export function linearRegression(data) {
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