/* Partitions */

export function partitionBase(selectionModule, selectionArgs) {
	if (selectionModule == null) {
		console.log('r case');
		//Arguements: selectionModule, selectionArgs, selectionModule, selectionArgs
		let selectionModule1 = selectionArgs[0];
		let selectionModule1Args = selectionArgs[1];
		
		let p1 = partitionBase(selectionModule1, selectionModule1Args);
		
		let selectionModule2 = selectionArgs[2];
		let selectionModule2Args = selectionArgs[3];
		let p2 = partitionBase(selectionModule2, selectionModule2Args);
		
		return p1.concat(p2);

	} else {

		//Arguements: selectionModuleArgs, module1, module1Args, module2, module2Args
		let p = selectionModule(selectionArgs[0]);
		let p1 = p[0]; // Example: Best 50
		let p2 = p[1]; // Rest
		console.log(p1);
		console.log(p2);
		let module1 = selectionArgs[1]; // Example: Flip bit
		let module1Args = selectionArgs[2]; // Example: 1 1
		let module2 = selectionArgs[3]; // Example: Flip bit
		let module2Args = selectionArgs[4]; // Example: 10 1

		let mp1 = module1([p1].concat(module1Args)); // Apply Flip bit 1 to best 50
		let mp2 = module2([p2].concat(module2Args)); // Apply Flip bit 10 to rest
		return mp1.concat(mp2); // Combine pops
	}
}



export class ModuleManager {
	constructor() {
		this.map = {
			'random': random,
			'best': best,
			'worst': worst,
			'nothing':nothing,
		};
	}
	
	getModule(name) {
		return this.map[name];
	}
}




