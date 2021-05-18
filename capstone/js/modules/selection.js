/* Contains all selection modules */


/* START OF SELECTION MODULES */

export function nothing(args) {
	let indArr = args[0];
	return indArr;
}

/*
 * Get numSelect random individuals
 * args: <indArr> <numSelect>
 */
export function random(args) {
	let indArr = args[0];
	let numSelect = args[1];

	let shuffled = _.shuffle(indArr);
	return [shuffled.slice(0, numSelect), shuffled.slice(numSelect, shuffled.length)];
}

/*
 * Get numSelect individuals using tournament (MAX)
 * args: <indArr> <numSelect> <objMod> <objArgs> <tournament size>
 */
export function tournamentBest(args) {
	let indArr = args[0];
	let numSelect = args[1];
	let objMod = args[2];
	let objArgs = args[3];
	let tourn = _.shuffle(indArr);
	tourn = tourn.slice(0, args[4]);
	tourn.sort(
		function(a, b) { 
			return objMod(b, objArgs) - objMod(a, objArgs);
		}
	);
	return [tourn.slice(0, numSelect), tourn.slice(numSelect, shuffled.length)];
}

/*
 * Get numSelect individuals using tournament (MIN)
 * args: <indArr> <numSelect> <objMod> <objArgs> <tournament size>
 */
export function tournamentWorst(args) {
	let indArr = args[0];
	let numSelect = args[1];
	let objMod = args[2];
	let objArgs = args[3];
	let tourn = _.shuffle(indArr);
	tourn = tourn.slice(0, args[4]);
	tourn.sort(
		function(a, b) { 
			return objMod(a, objArgs) - objMod(b, objArgs);
		}
	);
	return [tourn.slice(0, numSelect), tourn.slice(numSelect, shuffled.length)];
}

/*
 * Get numSelect individuals using stochastic acceptance (MAX)
 * args: <indArr> <numSelect> <objMod> <objArgs>
 */
export function accpetanceBest(args) {
	let indArr = args[0];
	let numSelect = args[1];
	let objMod = args[2];
	let objArgs = args[3];
	indArr.sort(
		function(a, b) { 
			return objMod(b, objArgs) - objMod(a, objArgs);
		}
	);
	let bestFit = objMod(indArr[0], objArgs);
	
	let selectedInds = [];
	
	for (let i = 0; i < numSelect; i++) {
		let isAccepted = false;
		let selectedInd = null;
		while(!isAccepted) {
			let shuffled = _.shuffle(indArr);
			selectedInd = shuffled[0];
			let curFitness = objMod(selectedInd, objArgs);
			let prob = curFitness / bestFit;
			if (Math.random() < prob) {
				isAccepted = true;
			}
		}
		selectedInds.push(selectedInd);
		shuffled.shift();
	}
	
	return [selectedInds, shuffled];
}

/*
 * Get numSelect individuals using stochastic acceptance (MIN)
 * args: <indArr> <numSelect> <objMod> <objArgs>
 */
export function accpetanceWorst(args) {
	let indArr = args[0];
	let numSelect = args[1];
	let objMod = args[2];
	let objArgs = args[3];
	indArr.sort(
		function(a, b) { 
			return objMod(b, objArgs) - objMod(a, objArgs);
		}
	);
	let bestFit = objMod(indArr[0], objArgs);
	
	let selectedInds = [];
	
	for (let i = 0; i < numSelect; i++) {
		let isAccepted = false;
		let selectedInd = null;
		while(!isAccepted) {
			let shuffled = _.shuffle(indArr);
			selectedInd = shuffled[0];
			let curFitness = objMod(selectedInd, objArgs);
			let prob = curFitness / bestFit;
			if (!(Math.random() < prob)) {
				isAccepted = true;
				
			}
		}
		selectedInds.push(selectedInd);
		selectedInds.push(selectedInd);
	}
	
	return [selectedInds, shuffled];
}

/*
 * Get numSelect best individuals
 * args: <indArr> <numSelect> <objMod> <objArgs>
 */
export function best(args) {
	let indArr = args[0];
	let numSelect = args[1];
	let objMod = args[2];
	let objArgs = args[3];
	indArr.sort(
		function(a, b) {
			let objArgsA = _.cloneDeep(objArgs);
			objArgsA[0] = a;
			let objArgsB = _.cloneDeep(objArgs);
			objArgsB[0] = b;

			return objMod(objArgsB) - objMod(objArgsA);
		}
	);
	
	return [indArr.slice(0, numSelect), indArr.slice(numSelect, indArr.length)];
}

/*
 * Get numSelect worst individuals
 * args: <indArr> <numSelect> <objMod> <objArgs>
 */
export function worst(args) {
	let indArr = args[0];
	let numSelect = args[1];
	let objMod = args[2];
	let objArgs = args[3];
	indArr.sort(
		function(a, b) {
			let objArgsA = _.cloneDeep(objArgs);
			objArgsA[0] = a;
			let objArgsB = _.cloneDeep(objArgs);
			objArgsB[0] = b;

			return objMod(objArgsA) - objMod(objArgsB);
		}
	);
	
	return [indArr.slice(0, numSelect), indArr.slice(numSelect, indArr.length)];
}

/* END OF SELECTION MODULES */

export class ModuleManager {
	constructor() {
		this.map = {
			'random': random,
			'tournamentBest': tournamentBest,
			'tournamentWorst': tournamentWorst,
			'accpetanceBest': accpetanceBest,
			'accpetanceWorst': accpetanceWorst,
			'best': best,
			'worst': worst,
		};
	}
	
	getModule(name) {
		return this.map[name];
	}
}




