/**
 * @class Archive holds each population in memory and each statistic about a population in memory
 *
 * @author Sahee Thao
 * @date 02/25/21
 *
 * @property {Array<Array<Individual>>}       pops      - each population was generated at generation i, where i is the index
 * @property {Array<AssoArray<String, Stat>>} popsStats - Each index i has an associative array of statistics at generation i
 */
class Archive {
	/**
	 * @constructor Initializes pops and popsStats
     *
     * @date 02/25/21
	 */
	constructor() {
		
	}
    
    static pops = {}; // Populations
    static popsStats = {}; // Store stats of populations so they don't have to be recalculated
	
	/**
	 * Add a copy of a population to pops. Adds an empty associative array to popsStats
     *
	 * @param {Array<Individual>} pop - the population to add a copy of to pops
	 *
     * @date 02/25/21
	 */
	static addPop(key, pop) {
		Archive.pops[key] = _.cloneDeep(pop);
		Archive.popsStats[key] = {};
	}
	
	/**
	 * Calculates and stores a certain statistic for a population and the individuals in that population
	 *
	 * @param popKey {*} - The key of the population
	 * @param statKey {*} - The statistic key
	 *
     * @date 02/25/21
	 */
	static calculatePopDataStat(popKey, dataKey, abs=true) {
		// Get the population stats of a particular population popKey
		let popStats = Archive.popsStats[popKey];
		if (!(dataKey in popStats)) {
            // statKey has not yet been calculated
            
			// Create and store statistic
			console.log('Calculating ' + dataKey + '...');
			
			// Get population of population from popKey
			let pop = Archive.pops[popKey];
			
			let popStatArr = [];
			
			// For each individual in population
			for (let i = 0; i < pop.length; i++) {
				let indDataArr = pop[i].getGamesData(dataKey, abs);

                // Add stat to the individual archive
				pop[i].archiveStats[dataKey] = new Stat(indDataArr, dataKey);
			
                // Add stat to the population archive
				popStatArr.concat(indDataArr);
			}
            let stat = new Stat(popStatArr, dataKey);
			Archive.popsStats[popKey][dataKey] = stat;
		} else {
            return popStats[dataKey];
        }
	}
}