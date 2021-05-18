/* Contains all chromosome initialization modules */


/* START OF INITIALIZATION MODULES */

/*
 * Create chromosomes with random 0s and 1s
 * args: <length>
 */
export function random(args) {
	let length = args[0]
	let chromosome = [];
	
	for (let i = 0; i < length; i++) {
		chromosome.push(_.random(0, 1));
	}
	
	return chromosome;
}

/*
 * Create chromosome based on string
 * args: <length> <str of gene(s)>
 */
export function pattern(args) {
	let length = args[0]
	let chromosome = [];
	
	for (let i = 0; i < length; i++) {
		let j = i % args[1].length;
		let c = args[1].charAt(j);
		chromosome.push(parseInt(c));	
	}
	
	return chromosome;
}


/* END OF INITIALIZATION MODULES */

export class ModuleManager {
	constructor() {
		this.map = {
			'random': random,
			'pattern': pattern,
		};
	}
	
	getModule(name) {
		return this.map[name];
	}
}




