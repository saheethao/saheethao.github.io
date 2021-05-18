import * as init from './initialization2.js';
import * as cx from './crossover2.js';
import * as mut from './mutate2.js';
import * as ind from '../individual.js';
import * as play from './play.js';
import * as sel from './selection2.js';
import * as obj from './objective2.js';
import * as axelrod from '../axelrod.js';
import * as strat from '../strategy.js';
var modInputs = {};
var buttonIdModMap = {};
var dataKeysMap = {};
var colorIdsMap = {};
var finalPop = [];
var finalArchive = null;
var named = '';
/* Tool Tips */
$('#chart-i').tooltip();
$('#load-ga-i').tooltip();
$('#load-pop-i').tooltip();
$('#load-eval-i').tooltip();
$('#copy-i').tooltip();
$('#hh-i').tooltip();
$('#network-i').tooltip();
$('#play-i').tooltip();

let rgb1 = [255, 194, 10];
let rgb2 = [12, 123, 220];
let chartCount = 0;

let migrationPath = [];

function start() {
	console.log('Starting...');
	newMain(10, 50);
}

function initPop(size) {
	// Other args, partition module initialization, partition module payoffs
	let pop = [];
	let r = gaPayoffs['r'];
	let s = gaPayoffs['s'];
	let t = gaPayoffs['t'];
	let p = gaPayoffs['p'];
	if(loadedIndividualsPop.length == 0) {
		let initModG = gaOperators['decision'].op;
		let genomeArgs = gaOperators['decision'].args;
		let initModH = gaOperators['history'].op;
		let histArgs = gaOperators['history'].args;
		// Partition logic
		for(let i = 0; i < size; i++) {
			let indiv = new ind.Individual();
			indiv.setGenome(initModG.execute(genomeArgs));
			indiv.setHist(initModH.execute(histArgs));
			indiv.setPayoffs(r, s, t, p);
			pop.push(indiv);
		}
	} else {
		for(let i = 0; i < loadedIndividualsPop.length; i++) {
			let indiv = new ind.Individual();
			indiv.setGenome(loadedIndividualsPop[i].genome);
			indiv.setHist(loadedIndividualsPop[i].hist);
			indiv.setPayoffs(r, s, t, p);
			pop.push(indiv);
		}
	}
	return pop;
}

function evolve(pop) {
	let len = pop.length;
	let off = _.cloneDeep(pop);
	// Crossover
	let cxMod = gaOperators['crossover'].op;
	let cxArgs = gaOperators['crossover'].args;
	cxArgs[0] = pop;
	off = cxMod.execute(cxArgs);
	// Mutation
	let mutMod = gaOperators['mutation'].op;
	let mutArgs = gaOperators['mutation'].args;
	mutArgs[0] = off;
	off = mutMod.execute(mutArgs);
	// Combine
	pop = pop.concat(off);
	// Play
	// Prepare for evaluation
	for(let i = 0; i < pop.length; i++) {
		pop[i].resetStats();
	}
	// Evaluate
	play.roundRobin([pop, 150]);
	// Select
	let selMod = gaOperators['selection'].op;
	let objMod = gaOperators['objective'].op;
	let objArgs = gaOperators['objective'].args;
	let selArgs = gaOperators['selection'].args;
	selArgs[0] = pop;
	selArgs[2] = objMod;
	selArgs[3] = objArgs;
	let selRes = selMod.execute(selArgs);
	pop = selRes[0];
	return pop;
}

function mod(n, m) {
  return ((n % m) + m) % m;
}
let oldCXSize = 0;
function evolveGrid(pop, width) {
	let len = pop.length;
	let off = [];
	// Crossover
	let cxMod = gaOperators['crossover'].op;
	let cxArgs = gaOperators['crossover'].args;
    
    // Create correct crossover
    // Get number of children PER parent
    let offspringSize = gaOperators['crossover'].args[1];
    oldCXSize = gaOperators['crossover'].args[1];
    
    // Go through pop and get all neighbors of each individual
    // Make children
    for (let i = 0; i < pop.length; i++) {
        let offI = [];
        let iX = i % width;
        let iY = Math.floor(i / width);
        let positions = [
            {x: mod(iX - 1, width), y: mod(iY - 1, width)}, // LU
            {x: iX    , y: mod(iY - 1, width)}, // U
            {x: mod(iX + 1, width), y: mod(iY - 1, width)}, // RU
            {x: mod(iX - 1, width), y: iY    }, // L
            {x: mod(iX + 1, width), y: iY    }, // R
            {x: mod(iX - 1, width), y: mod(iY + 1, width)}, // LD
            {x: iX    , y: iY + 1}, // D
            {x: mod(iX + 1, width), y: mod(iY + 1, width)}, // RD
        ];
        //i = x + width*y;
        
        let parentIndiv = pop[i];
        let mates = [];
        //console.log('cur: ' + i)
        //console.log('mates');
		for (let j = 0; j < positions.length; j++) {
            
            
            let mateIndex = (positions[j].x + width * positions[j].y) % pop.length;//((positions[j].x + width * positions[j].y % width) + width) % pop.length;
            //console.log(mateIndex);
            mates.push(pop[mateIndex]);
		}
        //console.log(positions);
        //console.log(mates);
        _.shuffle(mates);
        
        for (let j = 0; j < offspringSize; j++) {
            //console.log(i + ' ' + (j % mates.length));
            cxArgs[0] = [parentIndiv, mates[j % mates.length]];
            cxArgs[1] = 1;
            //console.log(cxArgs);
            offI.push(cxMod.execute(cxArgs)[0]);
        }
        off.push(offI);
	}
    
	cxArgs[1] = offspringSize; // Re-set size
	
	// Mutation
	let mutMod = gaOperators['mutation'].op;
	let mutArgs = gaOperators['mutation'].args;
    
    for (let i = 0; i < off.length; i++) {
        mutArgs[0] = off[i];
        off[i] = mutMod.execute(mutArgs);
    }
	
    console.log('off');
    console.log(off);
	
	// Play
	for (let i = 0; i < pop.length; i++) {
		pop[i].resetStats();
        for (let j = 0; j < off[i].length; j++) {
            off[i][j].resetStats();
        }
	}
    
	// Evaluate
	play.roundRobinGridOffspring([pop, 150, width, off]);
	// Select
	let selMod = gaOperators['selection'].op;
	let objMod = gaOperators['objective'].op;
	let objArgs = gaOperators['objective'].args;
	let selArgs = gaOperators['selection'].args;
    
    for (let i = 0; i < pop.length; i++) {
        let selPop = off[i];
        selPop.push(pop[i]); // parent + offspring
        let selNum = 1;
        let selArgsGrid = [selPop, selNum, objMod, objArgs];
        let selRes = selMod.execute(selArgsGrid);
        let survivor = selRes[0][0];
        pop[i] = survivor;
    }

	return pop;
}


function main(gens, popSize) {
	let archive = new ind.Archive();
	let pop = initPop(popSize);
	let popKeys = [];
	let dataKeys = {};
	// Prepare for evaluation
	for(let i = 0; i < pop.length; i++) {
		pop[i].resetStats();
	}
	// Evaluate
	play.roundRobin([pop, 150]);
	archive.addPop(0, pop);
	archive.calculatePopDataStat(0, 'selfScore');
	popKeys.push(0);
	let datasets = createDatasets(archive, popKeys, dataKeys);
	let chart = createChart(datasets, popKeys, 'myChart');
	console.log('-- Begining evolution --');
	for(let g = 1; g <= gens; g++) {
		console.log('--- Generation: ' + g + ' ---');
		pop = evolve(pop);
		archive.addPop(g, pop);
		archive.calculatePopDataStat(g, 'selfScore');
		popKeys.push(g);
		addToDatasets(archive, g, dataKeys, datasets);
		updateChart(chart, popKeys, datasets);
		setTimeout(function() {
			$('#console').trigger('custom', [g, gens, pop, archive, dataKeys, popKeys, datasets, chart]);
		}, 10);
	}
	console.log('-- End of evolution --');
	//graph(archive, popKeys, dataKeys);
	console.log(datasets);
}

function newMain(gens, popSize) {
	console.log('-- Begining evolution --');
	console.log('Generations: ' + gens);
	console.log('Population size: ' + popSize);
	console.log('Payoffs');
	console.log('r: ' + gaPayoffs['r']);
	console.log('s: ' + gaPayoffs['s']);
	console.log('t: ' + gaPayoffs['t']);
	console.log('p: ' + gaPayoffs['p']);
	console.log('Initialization');
	console.log('Decision Op:');
	console.log(gaOperators['decision'].op);
	console.log('Decision Args:');
	console.log(gaOperators['decision'].args);
	console.log('History Op:');
	console.log(gaOperators['history'].op);
	console.log('History Args:');
	console.log(gaOperators['history'].args);
	console.log('Crossover Op:');
	console.log(gaOperators['crossover'].op);
	console.log('Crossover Args:');
	console.log(gaOperators['crossover'].args);
	console.log('Mutation Op:');
	console.log(gaOperators['mutation'].op);
	console.log('Mutation Args:');
	console.log(gaOperators['mutation'].args);
	console.log('Objective Op:');
	console.log(gaOperators['objective'].op);
	console.log('Objective Args:');
	console.log(gaOperators['objective'].args);
	console.log('Selection Op:');
	console.log(gaOperators['selection'].op);
	console.log('Selection Args:');
	console.log(gaOperators['selection'].args);
	let archive = new ind.Archive();
	let pop = initPop(gaOperators['selection'].args[1]);
	let popKeys = [];
	let g = 0;
	// Prepare for evaluation
	for(let i = 0; i < pop.length; i++) {
		pop[i].resetStats();
	}
	// Evaluate
	play.roundRobin([pop, 150]);
	archive.addPop(g, pop);
	for(let i = 0; i < chartCount; i++) {
		let dataKeys = dataKeysMap[i];
		for(let dataKey in dataKeys) {
			archive.calculatePopDataStat(g, dataKey);
		}
	}
	popKeys.push(g);
	let datasetsMap = {};
	let chartMap = {};
	for(let i = 0; i < chartCount; i++) {
		let dataKeys = dataKeysMap[i];
		for(let dataKey in dataKeys) {
			let datasets = createDatasets(archive, popKeys, dataKeys, i);
			datasetsMap[i] = datasets;
			let chart = createChart(datasets, popKeys, 'chart-' + i);
			chartMap[i] = chart;
		}
	}
	g++;
	setTimeout(function() {
		$('#console').trigger('custom', [g, gens, pop, archive, dataKeysMap, popKeys, datasetsMap, chartMap]);
	}, 10);
}
let oldSelSize = 0;
function gridMain(gens, popSize) {
	console.log('-- Begining evolution --');
	console.log('Generations: ' + gens);
	console.log('Population size: ' + popSize);
	console.log('Payoffs');
	console.log('r: ' + gaPayoffs['r']);
	console.log('s: ' + gaPayoffs['s']);
	console.log('t: ' + gaPayoffs['t']);
	console.log('p: ' + gaPayoffs['p']);
	console.log('Initialization');
	console.log('Decision Op:');
	console.log(gaOperators['decision'].op);
	console.log('Decision Args:');
	console.log(gaOperators['decision'].args);
	console.log('History Op:');
	console.log(gaOperators['history'].op);
	console.log('History Args:');
	console.log(gaOperators['history'].args);
	console.log('Crossover Op:');
	console.log(gaOperators['crossover'].op);
	console.log('Crossover Args:');
	console.log(gaOperators['crossover'].args);
	console.log('Mutation Op:');
	console.log(gaOperators['mutation'].op);
	console.log('Mutation Args:');
	console.log(gaOperators['mutation'].args);
	console.log('Objective Op:');
	console.log(gaOperators['objective'].op);
	console.log('Objective Args:');
	console.log(gaOperators['objective'].args);
	console.log('Selection Op:');
	console.log(gaOperators['selection'].op);
	console.log('Selection Args:');
	console.log(gaOperators['selection'].args);
	let archive = new ind.Archive();
    let width = Math.ceil(Math.sqrt(gaOperators['selection'].args[1]));
	let pop = initPop(width*width);
    // Correct operators
    oldSelSize = gaOperators['selection'].args[1];
    gaOperators['selection'].args[1] = width * width;
    let offspringSize = gaOperators['crossover'].args[1];
    if (offspringSize < gaOperators['selection'].args[1]) {
        gaOperators['crossover'].args[1] = 1; // Each parent creates only one child
    } else {
        offspringSize = Math.round(offspringSize / gaOperators['crossover'].args[1]);
        gaOperators['crossover'].args[1] = offspringSize;
    }
    
	let popKeys = [];
	let g = 0;
	// Prepare for evaluation
	for(let i = 0; i < pop.length; i++) {
		pop[i].resetStats();
	}
    
    
    
	// Evaluate
	play.roundRobinGrid([pop, 150, width]);
	archive.addPop(g, pop);
	for(let i = 0; i < chartCount; i++) {
		let dataKeys = dataKeysMap[i];
		for(let dataKey in dataKeys) {
			archive.calculatePopDataStat(g, dataKey);
		}
	}
	popKeys.push(g);
	let datasetsMap = {};
	let chartMap = {};
	for(let i = 0; i < chartCount; i++) {
		let dataKeys = dataKeysMap[i];
		for(let dataKey in dataKeys) {
			let datasets = createDatasets(archive, popKeys, dataKeys, i);
			datasetsMap[i] = datasets;
			let chart = createChart(datasets, popKeys, 'chart-' + i);
			chartMap[i] = chart;
		}
	}
	g++;
	setTimeout(function() {
		$('#console').trigger('grid-custom', [g, gens, pop, archive, dataKeysMap, popKeys, datasetsMap, chartMap, width]);
	}, 10);
}

function evolveIsland(pop, ops) {
	let len = pop.length;
	let off = _.cloneDeep(pop);
	// Crossover
	let cxMod = ops['crossover'].op;
	let cxArgs = ops['crossover'].args;
	cxArgs[0] = pop;
	off = cxMod.execute(cxArgs);
	// Mutation
	let mutMod = ops['mutation'].op;
	let mutArgs = ops['mutation'].args;
	mutArgs[0] = off;
	off = mutMod.execute(mutArgs);
	// Combine
	pop = pop.concat(off);
	// Play
	// Prepare for evaluation
	for(let i = 0; i < pop.length; i++) {
		pop[i].resetStats();
	}
	// Evaluate
	play.roundRobin([pop, 150]);
	// Select
	let selMod = ops['selection'].op;
	let objMod = ops['objective'].op;
	let objArgs = ops['objective'].args;
	let selArgs = ops['selection'].args;
	selArgs[0] = pop;
	selArgs[2] = objMod;
	selArgs[3] = objArgs;
	let selRes = selMod.execute(selArgs);
	pop = selRes[0];
	return pop;
}


let islandFinalPops = [];
let islandFinalArchives = [];


function handleIslandEvolutionUpdate(g, gens, pops, islandArchives, dataKeysMap, popKeys, datasetsMapList, chartMapList, islandEAOperators, migrateGens) {
	console.log('--- Generation ' + g + ' ---');
    $('#gen-out').empty();
    $('#gen-out').append('<p>Generation ' + g + ' of ' + gens + '</p>');
    for (let p = 0; p < pops.length; p++) {
        console.log('     --- Pop ' + p + ' ---');
        pops[p] = evolveIsland(pops[p], islandEAOperators[p]);
        

        console.log('evolved:');
        console.log(pops[p]);
        islandArchives[p].addPop(g, pops[p]);
    }
    
    for (let i = 0; i < chartCount; i++) {
        let dataKeys = dataKeysMap[i];
		
        for (let p = 0; p < pops.length; p++) {
            let archive = islandArchives[p];
            for(let dataKey in dataKeys) {
                archive.calculatePopDataStat(g, dataKey);
            }
        }
    }
    
    popKeys.push(g);
    
    for(let i = 0; i < chartCount; i++) {
        for (let p = 0; p < pops.length; p++) {
            let archive = islandArchives[p];
            let datasetsMap = datasetsMapList[p];
            datasetsMap[i] = addToDatasets(archive, g, dataKeysMap[i], datasetsMap[i]);
            datasetsMapList[p] = datasetsMap;
            
            let chartMap = chartMapList[p];
            updateChart(chartMap[i], popKeys, datasetsMap[i]);
        }
	}
    
    g++
    
    if (g % migrateGens == 0) {
        // Get immigrants and new populations
        // Get operators
        let immigrants = []
        for (let i = 0; i < objIslandOps.length; i++) {
            let objOp = objIslandOps[i].op;
            let objArgs = objIslandOps[i].args;
            
            let selOp = selIslandOps[i].op;
            let selArgs = selIslandOps[i].args;
            let pop = pops[i];
            selArgs[0] = pop;
            selArgs[2] = objOp;
            selArgs[3] = objArgs;
            let selRes = selOp.execute(selArgs);
            immigrants.push(selRes[0]);
            pops[i] = selRes[1];
        }
        
        for (let i = 0; i < migrationPath.length; i++) {
            
            let toIsland = migrationPath[i];
            let fromIsland = i;
            console.log(`migrating from ${fromIsland} to ${toIsland}`);
            let toPop = pops[toIsland];
            toPop = toPop.concat(immigrants[fromIsland]);
            pops[toIsland] = toPop;
        }        
    }
    
    if (g <= gens) {
        setTimeout(function() {
		$('#console').trigger('island-custom', [g, gens, pops, islandArchives, dataKeysMap, popKeys, datasetsMapList, chartMapList, islandEAOperators, migrateGens]);
		}, 10);
    } else {
        
        
        finalPop = [];
		finalArchive = [];
        
        for (let p = 0; p < pops.length; p++) {
            finalPop = finalPop.concat(pops[p]);
            finalArchive.push(islandArchives[p]);
        }
        
    }
    
    
}

function handleEvolutionUpdate(g, gens, pop, archive, dataKeys, popKeys, datasetsMap, chartMap) {
	console.log('--- Generation ' + g + ' ---');
    $('#gen-out').empty();
    $('#gen-out').append('<p>Generation ' + g + ' of ' + gens + '</p>');
	pop = evolve(pop);

	console.log('evolved population:');
	console.log(pop);
	archive.addPop(g, pop);
	for(let i = 0; i < chartCount; i++) {
		let dataKeys = dataKeysMap[i];
		for(let dataKey in dataKeys) {
			archive.calculatePopDataStat(g, dataKey);
		}
	}
	popKeys.push(g);
	for(let i = 0; i < chartCount; i++) {
		datasetsMap[i] = addToDatasets(archive, g, dataKeysMap[i], datasetsMap[i]);
		updateChart(chartMap[i], popKeys, datasetsMap[i]);
	}
	g++;
	if(g <= gens) {
		setTimeout(function() {
			$('#console').trigger('custom', [g, gens, pop, archive, dataKeys, popKeys, datasetsMap, chartMap]);
		}, 10);
	} else {
		finalPop = pop;
		finalArchive = archive;
	}
}
const percentColors = [
    { pct: 0.0, color: { r: 0, g: 0, b: 0 } },
    { pct: 0.5, color: { r: 60, g: 180, b: 80 } },
    { pct: 1.0, color: { r: 255, g: 220, b: 80 } } ];

function generateColor(score) {
    let pct = score / 500;
    if (pct > 1) {
        pct = 1;
    }
    for (var i = 1; i < percentColors.length - 1; i++) {
        if (pct < percentColors[i].pct) {
            break;
        }
    }
    var lower = percentColors[i - 1];
    var upper = percentColors[i];
    var range = upper.pct - lower.pct;
    var rangePct = (pct - lower.pct) / range;
    var pctLower = 1 - rangePct;
    var pctUpper = rangePct;
    var color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };
    return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
    // or output as hex if preferred
};

function handleGridEvolutionUpdate(g, gens, pop, archive, dataKeys, popKeys, datasetsMap, chartMap, width) {
	console.log('--- Generation ' + g + ' ---');
    $('#gen-out').empty();
    $('#gen-out').append('<p>Generation ' + g + ' of ' + gens + '</p>');
	pop = evolveGrid(pop, width);
    
   $('#grid-table').empty();
   $('#grid-table').append('<table id="table-content"></table>');
   
   
   
   
    
	console.log('evolved population:');
	console.log(pop);
	archive.addPop(g, pop);
	for(let i = 0; i < chartCount; i++) {
		let dataKeys = dataKeysMap[i];
		for(let dataKey in dataKeys) {
			archive.calculatePopDataStat(g, dataKey);
		}
	}
    
    let posId = 0;
   for (let i = 0; i < width; i++) {
       let row = '';
       for (let j = 0; j <  width; j++) {
           let indiv = pop[posId];
           let scoreArrs = indiv.getGamesData('selfScore');
           let stat = new ind.Stat(scoreArrs, 'selfScore');
           let meanVal = stat.getAttr('mean');
           let rgbStr = generateColor(meanVal);
           row += `<td id="cell-${posId}" style="text-align: center; width: 50px; height: 50px; border: 1px solid black; background: ${rgbStr}">${Math.round(meanVal)}</td>`;
           posId++;
       }
       $('#table-content').append(`<tr>${row}</tr>`);
       
   }
   
	popKeys.push(g);
	for(let i = 0; i < chartCount; i++) {
		datasetsMap[i] = addToDatasets(archive, g, dataKeysMap[i], datasetsMap[i]);
		updateChart(chartMap[i], popKeys, datasetsMap[i]);
	}
    
    // update grid
    // TODO
	g++;
	if(g <= gens) {
		setTimeout(function() {
			$('#console').trigger('grid-custom', [g, gens, pop, archive, dataKeys, popKeys, datasetsMap, chartMap, width]);
		}, 10);
	} else {
		finalPop = pop;
		finalArchive = archive;
        gaOperators['crossover'].args[1] = oldCXSize;
        gaOperators['selection'].args[1] = oldSelSize;
	}
}

function createChart(datasets, popKeys, canvasId) {
	if($('#' + canvasId)) {
		$('#' + canvasId).remove();
	}
	$('#charts').append('<canvas id="' + canvasId + '"></canvas>');
	let ctx = $('#' + canvasId).get(0).getContext('2d');
	let chart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: popKeys,
			datasets: datasets
		},
		options: {
			animation: false,
		}
	});
	return chart;
}

function updateChart(chart, popKeys, newDatasets) {
	chart.data.datasets = newDatasets;
	chart.data.labels = popKeys;
	chart.update();
}

function addToDatasets(archive, popKey, dataKeys, datasets) {
	let popStats = archive.popsStats[popKey];
	// for each dataKey (selfScore, oppScore, r, ...)
	for(let dataKey in dataKeys) {
		let attrArr = dataKeys[dataKey];
		// for each attrKey (mean, min, std, ...)
		for(let i = 0; i < attrArr.length; i++) {
			let attr = attrArr[i];
			let label = dataKey + ' ' + attr;
			let dataValue = popStats[dataKey].getAttr(attr);
			let dataIdx = datasets.findIndex((dataset) => dataset.label == label);
			let dataset = datasets[dataIdx].data.push(dataValue);
		}
	}
	return datasets;
}

function createDatasets(archive, popKeys, dataKeys, num) {
	console.log('Creating datasets');
	let generationDataSets = [];
	// for each popKey (0, 1, 2, ...)
	for(let popKey in popKeys) {
		let popStats = archive.popsStats[popKey];
		// for each dataKey (selfScore, oppScore, r, ...)
		for(let dataKey in dataKeys) {
			let attrArr = dataKeys[dataKey];
			// for each attrKey (mean, min, std, ...)
			for(let i = 0; i < attrArr.length; i++) {
				let attr = attrArr[i];
				let label = dataKey + ' ' + attr;
				if(!(label in generationDataSets)) {
					console.log(`#${dataKey}-${attr}-color-${num}`);
					console.log($(`#${dataKey}-${attr}-color-${num}`).val());
					generationDataSets[label] = {
						data: [],
						color: $(`#${dataKey}-${attr}-color-${num}`).val()
					};
				}
				let dataValue = popStats[dataKey].getAttr(attr);
				generationDataSets[label].data.push(dataValue);
			}
		}
	}
	let datasets = [];
	console.log('generationDataSets');
	console.log(generationDataSets);
	for(let key in generationDataSets) {
		datasets.push({
			label: key,
			borderColor: generationDataSets[key].color,
			fill: false,
			data: generationDataSets[key].data
		});
	}
	return datasets;
}
/**
 * Chart archive of populations based on data keys
 */
function chart(archive, popKeys, dataKeys, canvasId) {
	let ctx = $('#' + canvasId).get(0).getContext('2d');
	let myLineChart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: popKeys,
			datasets: [{
				label: 'My First dataset',
				backgroundColor: 'rgb(255, 99, 132)',
				borderColor: 'rgb(255, 99, 132)',
				data: [0]
			}]
		},
		options: {
			elements: {
				line: {
					fill: false,
					tension: 0
				}
			}
		}
	});
	console.log('Creating graph');
	let generationDataSets = [];
	// for each popKey (0, 1, 2, ...)
	for(let popKey in popKeys) {
		let popStats = archive.popsStats[popKey];
		// for each dataKey (selfScore, oppScore, r, ...)
		for(let dataKey in dataKeys) {
			let attrArr = dataKeys[dataKey];
			// for each attrKey (mean, min, std, ...)
			for(let i = 0; i < attrArr.length; i++) {
				let attr = attrArr[i];
				let label = dataKey + ' ' + attr;
				if(!(label in generationDataSets)) {
					generationDataSets[label] = {
						data: []
					};
				}
				let dataValue = popStats[dataKey].getAttr(attr);
				generationDataSets[label].data.push(dataValue);
			}
		}
	}
	console.log('generation data sets');
	console.log(generationDataSets);
	let datasets = [];
	for(let key in generationDataSets) {
		datasets.push({
			label: key,
			borderColor: 'rgb(255, 99, 132)',
			fill: false,
			data: generationDataSets[key].data
		});
	}
	myLineChart.data.datasets = datasets;
	myLineChart.update();
}
// Custom event
$('#console').on('custom', function(event, g, gens, pop, archive, dataKeysMap, popKeys, datasetsMap, chartMap) {
	handleEvolutionUpdate(g, gens, pop, archive, dataKeysMap, popKeys, datasetsMap, chartMap);
});

$('#console').on('grid-custom', function(event, g, gens, pop, archive, dataKeysMap, popKeys, datasetsMap, chartMap, width) {
	handleGridEvolutionUpdate(g, gens, pop, archive, dataKeysMap, popKeys, datasetsMap, chartMap, width);
});

$('#console').on('island-custom', function(event, g, gens, pops, islandArchives, dataKeysMap, popKeys, datasetsMapList, chartMapList, islandEAOperators, migrateGens) {
    handleIslandEvolutionUpdate(g, gens, pops, islandArchives, dataKeysMap, popKeys, datasetsMapList, chartMapList, islandEAOperators, migrateGens);
});


/*** GUI ***/

$('#ga-model-select').change(function() {
    $('#gen-out').empty();
    $('#grid-table').empty();
    $('#charts').empty();
    chartCount = 0;
    let model = parseInt($(this).val());
    console.log(model);
    $('#load-init-pop').hide();
    if (model === 0) {
        // standard
        $('#island-ga').hide();
        //$('#grid-ga').hide();
        $('#standard-ga').show();
        $('#load-init-pop').show();
        $('#run-grid').hide();
        $('#run-button').show();

    } else if (model === 1) {
        // grid
        $('#island-ga').hide();
        //$('#grid-ga').hide();
        $('#standard-ga').show();
        $('#load-init-pop').show();
        
        $('#run-button').hide();
        $('#run-grid').show();
    } else if (model === 2) {
        // island
        //$('#grid-ga').hide();

        $('#standard-ga').hide();
        $('#island-ga').show();
        
    }
    
});

var menuId = 'menu';

function display() {
	let names = ['Initialization'];
	let mods = [init];
	let submitFunctions = [];
	// for each section
	for(let i = 0; i < mods.length; i++) {
		// print each module
		$('#add').append('<h1>' + names[i] + '</h1>');
		// print each property
		for(let property in mods[i]) {
			let mod = new mods[i][property]();
			$('#add').append('<div id="' + property + '"></div>');
			let divId = '#' + property;
			$(divId).append('<h2>' + property + '</h2>');
			$(divId).append('<p>' + mod.getDesc() + '</p>');
			$(divId).append('<p>' + mod.getReturnDesc() + '</p>');
			$(divId).append('<br>');
			let argsDescArr = mod.getArgsDescArr();
			$(divId).append('<h3>Arguments</h3>');
			for(let a = 0; a < argsDescArr.length; a++) {
				$(divId).append('<p>' + argsDescArr[a] + '</p>');
			}
			$(divId).append('<h3>Input</h3>');
			let buttonId = 'submit-' + property;
			buttonIdModMap[buttonId] = mod;
			modInputs[buttonId] = [];
			// print each input for the module
			let args = mod.getArgs();
			for(let a = 0; a < args.length; a++) {
				let arg = args[a];
				let inputId = property + '-' + arg.name;
				$(divId).append('<label for="' + inputId + '">' + arg.name + '</label>');
				$(divId).append('<input type="text" id="' + inputId + '" name="' + inputId + '">');
				$(divId).append('<br>');
				modInputs[buttonId].push({
					inputId: inputId,
					argName: arg.name
				});
			}
			$(divId).append('<p id="' + buttonId + '" onclick="gotClick(\'' + buttonId + '\');">click me</p>');
		}
	}
	console.log(modInputs);
}
var gaOperators = {
	'decision': null,
	'history': null,
	'objective': null,
	'crossover': null,
	'mutation': null,
	'selection': null,
};

function gotClick(buttonId) {
	console.log('inputIds:');
	let inputIds = modInputs[buttonId];
	console.log(inputIds);
	let args = {};
	for(let i = 0; i < inputIds.length; i++) {
		let inputId = inputIds[i].inputId.replace(/\s+/g, '');
		let argName = inputIds[i].argName;
		let val = $('#' + inputId).val();
		args[argName] = val;
	}
	// Automatically add lengths to initalization args
	let op = inputIds[0].op.op;
	let opArgs = op.toArgsArr(args);
	let phase = inputIds[0].phase;
	// validate arguements
	let validation = op.validate(opArgs);
	if(validation != null) {
		let errorMessage = 'Error for ' + validation.arg + ': ' + validation.msg;
		console.log(errorMessage);
        alert(errorMessage);
	} else {
		console.log('Successful');
		gaOperators[phase] = {
			op: op,
			args: opArgs
		};
		$('#' + phase + '-operator').empty();
		$('#' + phase + '-operator').html(op.getName());
		console.log(gaOperators);
	}
}
var modules = {};

function setMods() {
	let names = ['Initialization', 'Mutation', 'Crossover', 'Selection', 'Objective'];
	let mods = [init, mut, cx, sel, obj];
	let submitFunctions = [];
	// for each module
	for(let i = 0; i < mods.length; i++) {
		let name = names[i];
		modules[name] = [];
		let mod = mods[i];
		// print each property (operator name)
		for(let property in mod) {
			let op = new mod[property]();
			let desc = op.getDesc();
			let returnDesc = op.getReturnDesc();
			//let argsDesc = op.getArgsDescArr();            
			let args = op.getArgs();
			let operator = {
				name: property,
				desc: desc,
				returnDesc: returnDesc,
				args: args,
				op: op
			};
			modules[name].push(operator);
		}
	}
}
setMods();
console.log('modules');
console.log(modules);
/* When a 'phase' button is pressed */
$('#decision').click(function() {
	generateOperators('Initialization', 'decision');
	console.log('gaOperators.decision != null? ' + (gaOperators.decision != null));
	if(gaOperators.decision != null) {
		let idBase = '#Initialization-' + gaOperators.decision.op.constructor.name + '-';
		console.log('idBase ' + idBase);
		for(let i = 0; i < gaOperators.decision.op.args.length; i++) {
			let id = idBase + gaOperators.decision.op.args[i].name.replace(/\s+/g, '');
			console.log('id ' + id);
			if(gaOperators.decision.op.args[i].name != 'Length') {
				console.log('value ' + gaOperators.decision.args[i]);
				$(id).val(gaOperators.decision.args[i]);
			}
		}
	}
});
$('#history').click(function() {
	generateOperators('Initialization', 'history');
	if(gaOperators.history != null) {
		let idBase = '#Initialization-' + gaOperators.history.op.constructor.name + '-';
		for(let i = 0; i < gaOperators.history.op.args.length; i++) {
			let id = idBase + gaOperators.history.op.args[i].name.replace(/\s+/g, '');
			if(gaOperators.history.op.args[i].name != 'Length') {
				$(id).val(gaOperators.history.args[i]);
			}
		}
	}
});
$('#mutation').click(function() {
	generateOperators('Mutation', 'mutation');
	if(gaOperators.mutation != null) {
		let idBase = '#Mutation-' + gaOperators.mutation.op.constructor.name + '-';
		for(let i = 0; i < gaOperators.mutation.op.args.length; i++) {
			let id = idBase + gaOperators.mutation.op.args[i].name.replace(/\s+/g, '');
			if(gaOperators.mutation.op.args[i].name != 'Population') {
				$(id).val(gaOperators.mutation.args[i]);
			}
		}
	}
});
$('#crossover').click(function() {
	generateOperators('Crossover', 'crossover');
	if(gaOperators.crossover != null) {
		let idBase = '#Crossover-' + gaOperators.crossover.op.constructor.name + '-';
		for(let i = 0; i < gaOperators.crossover.op.args.length; i++) {
			let id = idBase + gaOperators.crossover.op.args[i].name.replace(/\s+/g, '');
			if(gaOperators.crossover.op.args[i].name != 'Population') {
				$(id).val(gaOperators.crossover.args[i]);
			}
		}
	}
});
$('#selection').click(function() {
	generateOperators('Selection', 'selection');
	if(gaOperators.selection != null) {
		let idBase = '#Selection-' + gaOperators.selection.op.constructor.name + '-';
		for(let i = 0; i < gaOperators.selection.op.args.length; i++) {
			let id = idBase + gaOperators.selection.op.args[i].name.replace(/\s+/g, '');
			if(gaOperators.selection.op.args[i].name != 'Population') {
				$(id).val(gaOperators.selection.args[i]);
			}
		}
	}
});
$('#objective').click(function() {
	generateOperators('Objective', 'objective');
	if(gaOperators.objective != null) {
		console.log(gaOperators.objective.op.constructor.name);
		let idBase = '#Objective-' + gaOperators.objective.op.constructor.name + '-';
		for(let i = 0; i < gaOperators.objective.op.args.length; i++) {
			let id = idBase + gaOperators.objective.op.args[i].name.replace(/\s+/g, '');
			if(gaOperators.objective.op.args[i].name != 'Individual') {
				$(id).val(gaOperators.objective.args[i]);
			}
		}
	}
});
$('#select-button').click(function() {
	gaOperators = JSON.parse(savedGA);
	console.log('parsed');
	console.log(gaOperators);
});

function generateOperators(moduleName, phase, append = false) {
	let operators = modules[moduleName];
	if(!append) {
		$('#' + menuId).empty();
	}
	$('#' + menuId).append(`<h2>${moduleName}</h2>`);
	for(let i = 0; i < operators.length; i++) {
		let op = operators[i];
		$('#' + menuId).append(`<h4>${op.op.name} <svg id="${i}-i" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16" data-toggle="tooltip" data-placement="right" 
        title="${op.op.description}">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
</svg></h4>`);
		$(`#${i}-i`).tooltip();
		let args = op.args;
		let buttonId = 'submit' + '-' + op.name;
		modInputs[buttonId] = [];
		for(let j = 0; j < args.length; j++) {
			let arg = args[j];
			let inputId = moduleName + '-' + op.name + '-' + arg.name.replace(/\s+/g, '');
			if(moduleName == 'Initialization' && arg.name == 'Length') {
				let val = 64;
				if(phase == 'history') {
					val = 6;
				}
				$('#' + menuId).append(`
                <div hidden class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text">${arg.name}</span>
                    </div>
                    <input type="text" value="${val}" id="${inputId}" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default"">
                </div>`);
			} else if((moduleName == 'Mutation' || moduleName == 'Crossover' || moduleName == 'Selection') && arg.name == 'Population') {
				$('#' + menuId).append(`
                <div hidden class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text">${arg.name}</span>
                    </div>
                    <input type="text" value="pop" id="${inputId}" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default"">
                </div>`);
			} else if(moduleName == 'Objective' && arg.name == 'Individual') {
				$('#' + menuId).append(`
                <div hidden class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text">${arg.name}</span>
                    </div>
                    <input type="text" value="ind" id="${inputId}" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default"">
                </div>`);
			} else if(moduleName == 'Selection' && arg.name == 'Objective Module') {
				$('#' + menuId).append(`
                <div hidden class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text">${arg.name}</span>
                    </div>
                    <input type="text" value="objMod" id="${inputId}" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default"">
                </div>`);
			} else if(moduleName == 'Selection' && arg.name == 'Objective Module Arguments') {
				$('#' + menuId).append(`
                <div hidden class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text">${arg.name}</span>
                    </div>
                    <input type="text" value="objModArgs" id="${inputId}" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default"">
                </div>`);
			} else if(moduleName == 'Objective' && arg.name == 'Attribute') {
				$('#' + menuId).append(`
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text">${arg.name}</span>
                    </div>
                    <select id="${inputId}">
                        <option value="selfScore">Self Score</option>
                        <option value="oppScore">Opponent's Score</option>
                        <option value="r">R Payoff</option>
                        <option value="s">S Payoff</option>
                        <option value="t">T Payoff</option>
                        <option value="p">P Payoff</option>
                        <option value="selfBitUse">Self Bit Use</option>
                        <option value="oppBitUse">Opponent Bit Use</option>
                        <option value="difference">Score Difference</option>
                        <option value="win">Win</option>
                        <option value="tie">Tie</option>
                        <option value="loss">Loss</option>
                        <option value="node">Node</option>
                        <option value="edge">Edge</option>
                    </select>
                </div>`);
			} else if(moduleName == 'Objective' && arg.name == 'Statistic') {
				$('#' + menuId).append(`
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text">${arg.name}</span>
                    </div>
                    <select id="${inputId}">
                        <option value="max">Max</option>
                        <option value="min">Min</option>
                        <option value="range">Range</option>
                        <option value="midrange">Midrange</option>
                        <option value="mean">Mean</option>
                        <option value="sum">Sum</option>
                        <option value="median">Median</option>
                        <option value="variance">Variance</option>
                        <option value="std">Standard Deviation</option>
                    </select>
                </div>`);
			} else {
				$('#' + menuId).append(`
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text">${arg.name}&nbsp;<svg id="${inputId}-i" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16" data-toggle="tooltip" data-placement="right" 
        title="${arg.description} ${arg.validationDescription}">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
</svg></span>
                    </div>
                    <input type="text" id="${inputId}" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default"">
                </div>`);
				$(`#${inputId}-i`).tooltip();
			}
			modInputs[buttonId].push({
				inputId: inputId,
				argName: arg.name,
				op: op,
				phase: phase
			});
		}
		$('#' + menuId).append('<a class="btn btn-primary" onclick="gotClick(\'' + buttonId + '\');">Select</a>');
	}
}
let gaPayoffs = {};
let gaParameters = {};
$('#run-button').click(function() {
	let popSize = 1;
	let gens = $('#gens').val();
	if(popSize == '' || gens == '') {
		console.log('parameters not set');
		//$('#run-alert-par').show();
		alert('The GA parameters Population Size or Generations are not set.');
	} else {
		let popSizeNum = Number(popSize);
		let gensNum = Number(gens);
		if(Number.isInteger(popSizeNum)) {
			if(Number.isInteger(gensNum)) {
				gaParameters['popSize'] = popSizeNum;
				gaParameters['gens'] = gensNum;
			} else {
				alert('The value for Generations, ' + gens + ', is not an integer');
			}
		} else {
			alert('The value for Population Size, ' + popSize + ', is not an integer');
		}
	}
	let isReady = true;
	let payoffs = ['r', 's', 't', 'p'];
	let i = 0;
	for(i = 0; i < payoffs.length; i++) {
		let val = $('#' + payoffs[i] + '-payoff').val();
		//console.log(val);
		if(val == '') {
			isReady = false;
			break;
		} else {
			let payoffNum = Number(val);
			if(isNaN(payoffNum)) {
				isReady = false;
				break;
			}
			gaPayoffs[payoffs[i]] = Number(val);
		}
	}
	if(isReady) {
		console.log(gaPayoffs);
	} else {
		console.log('Payoff ' + payoffs[i] + ' is not a number');
		alert('Payoff ' + payoffs[i] + ' is not a number');
		//$('#run-alert-pay').show();
	}
	isReady = true;
	for(let mod in gaOperators) {
		if(gaOperators[mod] == null) {
			isReady = false;
			break;
		}
	}
	if(isReady) {
		console.log(gaOperators);
		console.log('All good');
		newMain(gens, popSize);
	} else {
		console.log('ops not set');
		alert('All operators are not set');
		//$('#run-alert-op').show();
	}
});

$('#run-grid').click(function() {
	let popSize = 1;
	let gens = $('#gens').val();
	if(popSize == '' || gens == '') {
		console.log('parameters not set');
		//$('#run-alert-par').show();
		alert('The GA parameters Population Size or Generations are not set.');
	} else {
		let popSizeNum = Number(popSize);
		let gensNum = Number(gens);
		if(Number.isInteger(popSizeNum)) {
			if(Number.isInteger(gensNum)) {
				gaParameters['popSize'] = popSizeNum;
				gaParameters['gens'] = gensNum;
			} else {
				alert('The value for Generations, ' + gens + ', is not an integer');
			}
		} else {
			alert('The value for Population Size, ' + popSize + ', is not an integer');
		}
	}
	let isReady = true;
	let payoffs = ['r', 's', 't', 'p'];
	let i = 0;
	for(i = 0; i < payoffs.length; i++) {
		let val = $('#' + payoffs[i] + '-payoff').val();
		//console.log(val);
		if(val == '') {
			isReady = false;
			break;
		} else {
			let payoffNum = Number(val);
			if(isNaN(payoffNum)) {
				isReady = false;
				break;
			}
			gaPayoffs[payoffs[i]] = Number(val);
		}
	}
	if(isReady) {
		console.log(gaPayoffs);
	} else {
		console.log('Payoff ' + payoffs[i] + ' is not a number');
		alert('Payoff ' + payoffs[i] + ' is not a number');
		//$('#run-alert-pay').show();
	}
	isReady = true;
	for(let mod in gaOperators) {
		if(gaOperators[mod] == null) {
			isReady = false;
			break;
		}
	}
	if(isReady) {
		console.log(gaOperators);
		console.log('All good');
		gridMain(gens, popSize);
	} else {
		console.log('ops not set');
		alert('All operators are not set');
		//$('#run-alert-op').show();
	}
});

$('#save-button').click(function() {
	let popSize = 1;
	let gens = $('#gens').val();
	if(popSize == '' || gens == '') {
		console.log('parameters not set');
		//$('#run-alert-par').show();
		alert('The GA parameters Population Size or Generations are not set.');
	} else {
		let popSizeNum = Number(popSize);
		let gensNum = Number(gens);
		if(Number.isInteger(popSizeNum)) {
			if(Number.isInteger(gensNum)) {
				gaParameters['popSize'] = popSizeNum;
				gaParameters['gens'] = gensNum;
			} else {
				alert('The value for Generations, ' + gens + ', is not an integer');
			}
		} else {
			alert('The value for Population Size, ' + popSize + ', is not an integer');
		}
	}
	let isReady = true;
	let payoffs = ['r', 's', 't', 'p'];
	let i = 0;
	for(i = 0; i < payoffs.length; i++) {
		let val = $('#' + payoffs[i] + '-payoff').val();
		//console.log(val);
		if(val == '') {
			isReady = false;
			break;
		} else {
			let payoffNum = Number(val);
			if(isNaN(payoffNum)) {
				isReady = false;
				break;
			}
			gaPayoffs[payoffs[i]] = Number(val);
		}
	}
	if(isReady) {
		console.log(gaPayoffs);
	} else {
		console.log('Payoff ' + payoffs[i] + ' is not a number');
		alert('Payoff ' + payoffs[i] + ' is not a number');
		//$('#run-alert-pay').show();
	}
	isReady = true;
	for(let mod in gaOperators) {
		if(gaOperators[mod] == null) {
			isReady = false;
			break;
		}
	}
	if(isReady) {
		console.log(gaOperators);
		console.log('All good');
		$('#exampleModal').modal();
	} else {
		console.log('ops not set');
		alert('All operators are not set');
		//$('#run-alert-op').show();
	}
});
let savedGA = '';
$('#save-name').click(function() {
	let name = $('#ga-name').val();
	named = name;
	if(name.length >= 1) {
		//$('#modal-error').empty();
		$('#exampleModal').modal('hide');
		console.log('gaOperators');
		console.log(gaOperators);
		let simpleGaOperators = {
			crossover: {
				args: gaOperators.crossover.args,
				name: gaOperators.crossover.op.name,
				className: gaOperators.crossover.op.constructor.name
			},
			decision: {
				args: gaOperators.decision.args,
				name: gaOperators.decision.op.name,
				className: gaOperators.decision.op.constructor.name
			},
			history: {
				args: gaOperators.history.args,
				name: gaOperators.history.op.name,
				className: gaOperators.history.op.constructor.name
			},
			mutation: {
				args: gaOperators.mutation.args,
				name: gaOperators.mutation.op.name,
				className: gaOperators.mutation.op.constructor.name
			},
			objective: {
				args: gaOperators.objective.args,
				name: gaOperators.objective.op.name,
				className: gaOperators.objective.op.constructor.name
			},
			selection: {
				args: gaOperators.selection.args,
				name: gaOperators.selection.op.name,
				className: gaOperators.selection.op.constructor.name
			},
		}
		console.log('simpleGaOperators');
		console.log(simpleGaOperators);
		console.log('gaParameters');
		console.log(gaParameters);
		console.log('gaPayoffs');
		console.log(gaPayoffs);
		console.log('name');
		console.log(name);
		// if allGAs is empty, make sure to create an empty object
		let allGAsLoc = storage.getItem('allGAs');
		if(allGAsLoc == null) {
			allGAsLoc = {};
		} else {
			allGAsLoc = JSON.parse(allGAsLoc);
		}
		// overrides if they are the same name
		allGAsLoc[name] = {
			simpleGaOperators, gaParameters, gaPayoffs
		};
		storage.setItem('allGAs', JSON.stringify(allGAsLoc));
	} else {
		//$('#modal-error').empty();
		//$('#modal-error').append('<div style="margin: auto;" class="alert alert-danger" role="alert">Name must have a length of at least 1</div>');
		alert('Name must have a length of at least 1');
	}
	allGAs = JSON.parse(storage.getItem('allGAs'));
});

function getOp(operators, targetName) {
	for(let i = 0; i < operators.length; i++) {
		let operator = operators[i];
		if(operator.name == targetName) {
			return operator.op;
		}
	}
	return null;
}

function createOperators(key) {
    console.log('Creating');
    console.log(key);
	named = key;
	let saved = JSON.parse(storage.getItem('allGAs'))[key];
    console.log(saved);
	let simpleGaOperators = saved.simpleGaOperators;
	let complex = {
		decision: {
			op: getOp(modules.Initialization, simpleGaOperators.decision.className),
			args: simpleGaOperators.decision.args
		},
		history: {
			op: getOp(modules.Initialization, simpleGaOperators.history.className),
			args: simpleGaOperators.history.args
		},
		crossover: {
			op: getOp(modules.Crossover, simpleGaOperators.crossover.className),
			args: simpleGaOperators.crossover.args
		},
		mutation: {
			op: getOp(modules.Mutation, simpleGaOperators.mutation.className),
			args: simpleGaOperators.mutation.args
		},
		selection: {
			op: getOp(modules.Selection, simpleGaOperators.selection.className),
			args: simpleGaOperators.selection.args
		},
		objective: {
			op: getOp(modules.Objective, simpleGaOperators.objective.className),
			args: simpleGaOperators.objective.args
		},
	};
	return complex;
}
var storage = window.localStorage;
console.log('allGAs');
console.log(JSON.parse(storage.getItem('allGAs')));
//ga-list
//$( ".inner" ).append( "<p>Test</p>" );
//$( ".inner" ).append( "<p>Test</p>" );
let allGAs = JSON.parse(storage.getItem('allGAs'));
console.log('Creating Load a GA list');
for(let key in allGAs) {
	console.log(key);
	$('#ga-list').append('<li class="list-group-item list-group-item-action ga-item"><span>' + key + '</span></li>');
	$('#ga-list-island').append('<li class="list-group-item list-group-item-action ga-item-island"><span>' + key + '</span></li>');
}
$('.ga-item').click(function() {
	let key = $(this).text();
	console.log('Loading in ' + key);
	gaOperators = createOperators(key);
	console.log(gaOperators);
	// Update HTML
	let phases = ['decision', 'history', 'crossover', 'mutation', 'selection', 'objective'];
	for(let i = 0; i < phases.length; i++) {
		let phase = phases[i];
		let op = gaOperators[phase].op;
		$('#' + phase + '-operator').empty();
		$('#' + phase + '-operator').html(op.getName());
	}
});

//OBJ SELECTION
let objIslandInputs = {};
let objIslandOps = [];

function objIslandClick(buttonId) {
	console.log('inputIds:');
	let inputIds = objIslandInputs[buttonId];
	console.log(inputIds);
	let args = {};
	for(let i = 0; i < inputIds.length; i++) {
		let inputId = inputIds[i].inputId.replace(/\s+/g, '');
		let argName = inputIds[i].argName;
		let val = $('#' + inputId).val();
		args[argName] = val;
	}
	// Automatically add lengths to initalization args
	let op = inputIds[0].op.op;
	let opArgs = op.toArgsArr(args);
	let pos = inputIds[0].pos;
	// validate arguements
	let validation = op.validate(opArgs);
	if(validation != null) {
		let errorMessage = 'Error for ' + validation.arg + ': ' + validation.msg;
		console.log(errorMessage);
        alert(errorMessage);
	} else {
		console.log('Successful');
		objIslandOps[pos] = {
			op: op,
			args: opArgs
		};
		$('#obj-name-island-' + pos).empty();
		$('#obj-name-island-' + pos).html(op.getName());
		console.log(objIslandOps);
	}
}

function generateObjectiveIsland(pos) {
    let moduleName = 'Objective';
	let operators = modules[moduleName];
    let islandMenu = 'islandSettings';
	$('#' + islandMenu).empty();
	$('#' + islandMenu).append(`<h2>${moduleName}</h2>`);
	for (let i = 0; i < operators.length; i++) {
		let op = operators[i];
		$('#' + islandMenu).append(`<h4>${op.op.name} <svg id="${i}-i" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16" data-toggle="tooltip" data-placement="right" 
        title="${op.op.description}">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
</svg></h4>`);
		$(`#${i}-i`).tooltip();
		let args = op.args;
		let buttonId = 'submit' + '-' + op.name;
		objIslandInputs[buttonId] = [];
		for(let j = 0; j < args.length; j++) {
			let arg = args[j];
			let inputId = moduleName + '-' + op.name + '-' + arg.name.replace(/\s+/g, '') + '-island';
			if (moduleName == 'Objective' && arg.name == 'Individual') {
				$('#' + islandMenu).append(`
                <div hidden class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text">${arg.name}</span>
                    </div>
                    <input type="text" value="ind" id="${inputId}" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default"">
                </div>`);
			} else if(moduleName == 'Objective' && arg.name == 'Attribute') {
				$('#' + islandMenu).append(`
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text">${arg.name}</span>
                    </div>
                    <select id="${inputId}">
                        <option value="selfScore">Self Score</option>
                        <option value="oppScore">Opponent's Score</option>
                        <option value="r">R Payoff</option>
                        <option value="s">S Payoff</option>
                        <option value="t">T Payoff</option>
                        <option value="p">P Payoff</option>
                        <option value="selfBitUse">Self Bit Use</option>
                        <option value="difference">Score Difference</option>
                        <option value="win">Win</option>
                        <option value="tie">Tie</option>
                        <option value="loss">Loss</option>
                        <option value="node">Node</option>
                        <option value="edge">Edge</option>
                    </select>
                </div>`);
			} else if(moduleName == 'Objective' && arg.name == 'Statistic') {
				$('#' + islandMenu).append(`
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text">${arg.name}</span>
                    </div>
                    <select id="${inputId}">
                        <option value="max">Max</option>
                        <option value="min">Min</option>
                        <option value="range">Range</option>
                        <option value="midrange">Midrange</option>
                        <option value="mean">Mean</option>
                        <option value="sum">Sum</option>
                        <option value="median">Median</option>
                        <option value="variance">Variance</option>
                        <option value="std">Standard Deviation</option>
                    </select>
                </div>`);
			} else {
				$('#' + islandMenu).append(`
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text">${arg.name}&nbsp;<svg id="${inputId}-i" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16" data-toggle="tooltip" data-placement="right" 
        title="${arg.description} ${arg.validationDescription}">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
</svg></span>
                    </div>
                    <input type="text" id="${inputId}" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default"">
                </div>`);
				$(`#${inputId}-i`).tooltip();
			}
			objIslandInputs[buttonId].push({
				inputId: inputId,
				argName: arg.name,
				op: op,
				pos: pos
			});
		}
		$('#' + islandMenu).append(`<a class="btn btn-primary" id="objective-island-${i}" onclick="objIslandClick('${buttonId}')">Select</a>`);
	}
}
// SELECTION ISLAND
let selIslandInputs = {};
let selIslandOps = [];

function selIslandClick(buttonId) {
	console.log('inputIds:');
	let inputIds = selIslandInputs[buttonId];
	console.log(inputIds);
	let args = {};
	for(let i = 0; i < inputIds.length; i++) {
		let inputId = inputIds[i].inputId.replace(/\s+/g, '');
		let argName = inputIds[i].argName;
		let val = $('#' + inputId).val();
		args[argName] = val;
	}
	// Automatically add lengths to initalization args
	let op = inputIds[0].op.op;
	let opArgs = op.toArgsArr(args);
	let pos = inputIds[0].pos;
	// validate arguements
	let validation = op.validate(opArgs);
	if(validation != null) {
		let errorMessage = 'Error for ' + validation.arg + ': ' + validation.msg;
		console.log(errorMessage);
        alert(errorMessage);
	} else {
		console.log('Successful');
		selIslandOps[pos] = {
			op: op,
			args: opArgs
		};
		$('#sel-name-island-' + pos).empty();
		$('#sel-name-island-' + pos).html(op.getName());
		console.log(selIslandOps);
	}
}

function generateSelectionIsland(pos) {
    let moduleName = 'Selection';
	let operators = modules[moduleName];
    let islandMenu = 'islandSettings';
	$('#' + islandMenu).empty();
	$('#' + islandMenu).append(`<h2>${moduleName}</h2>`);
	for (let i = 0; i < operators.length; i++) {
		let op = operators[i];
		$('#' + islandMenu).append(`<h4>${op.op.name} <svg id="${i}-i" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16" data-toggle="tooltip" data-placement="right" 
        title="${op.op.description}">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
</svg></h4>`);
		$(`#${i}-i`).tooltip();
		let args = op.args;
		let buttonId = 'submit' + '-' + op.name;
		selIslandInputs[buttonId] = [];
		for(let j = 0; j < args.length; j++) {
			let arg = args[j];
			let inputId = moduleName + '-' + op.name + '-' + arg.name.replace(/\s+/g, '') + '-island';
			if (moduleName == 'Selection' && arg.name == 'Objective Module') {
				$('#' + islandMenu).append(`
                <div hidden class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text">${arg.name}</span>
                    </div>
                    <input type="text" value="objMod" id="${inputId}" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default"">
                </div>`);
			} else if(moduleName == 'Selection' && arg.name == 'Population') {
				$('#' + islandMenu).append(`
                <div hidden class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text">${arg.name}</span>
                    </div>
                    <input type="text" value="pop" id="${inputId}" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default"">
                </div>`);
			} else if(moduleName == 'Selection' && arg.name == 'Objective Module Arguments') {
				$('#' + islandMenu).append(`
                <div hidden class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text">${arg.name}</span>
                    </div>
                    <input type="text" value="objModArgs" id="${inputId}" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default"">
                </div>`);
			} else {
				$('#' + islandMenu).append(`
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text">${arg.name}&nbsp;<svg id="${inputId}-i" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16" data-toggle="tooltip" data-placement="right" 
        title="${arg.description} ${arg.validationDescription}">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
</svg></span>
                    </div>
                    <input type="text" id="${inputId}" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default"">
                </div>`);
				$(`#${inputId}-i`).tooltip();
			}
			selIslandInputs[buttonId].push({
				inputId: inputId,
				argName: arg.name,
				op: op,
				pos: pos
			});
		}
		$('#' + islandMenu).append(`<a class="btn btn-primary" id="selection-island-${i}" onclick="selIslandClick('${buttonId}')">Select</a>`);
	}
}



function islandMain() {
    let gens = parseInt($('#gens-island').val());
    let migrateGens = parseInt($('#gens-migrate-island').val());;
    let popKeys = [];
    
    migrationPath = [];
    // Set migration path
    
    for (let i = 0; i < islandList.length; i++) {
        let val = parseInt($('#migrate-' + i).val());
        migrationPath.push(val);
    }
    
    console.log('All componenets');
    console.log('selIslandOps');
    console.log(selIslandOps);
    if (selIslandOps.length < islandList.length) {
        let error = 'Island Selection Operators are not set!';
        console.log(error);
        alert(error);
        return;
    }
    for (let i = 0; i < selIslandOps.length; i++) {
        if (selIslandOps[i] == null) {
            let error = 'Island Selection Operators are not set!';
            console.log(error);
            alert(error);
            return;
        }
    }
    
    console.log('objIslandOps');
    console.log(objIslandOps);
    if (objIslandOps.length < islandList.length) {
        let error = 'Island Objective Operators are not set!';
        console.log(error);
        alert(error);
        return;
    }
    
    for (let i = 0; i < objIslandOps.length; i++) {
        if (objIslandOps[i] == null) {
            let error = 'Island Objective Operators are not set!';
            console.log(error);
            alert(error);
            return;
        }
    }
    
    console.log('islandList');
    console.log(islandList);
    let islandEAOperators = [];
    for (let i = 0; i < islandList.length; i++) {
        let island = islandList[i];
        
        let operators = createOperators(island.key);
        console.log(operators);
        islandEAOperators.push(operators);
    }
    

    
    
    
    console.log('islandEAOperators');
    console.log(islandEAOperators);
    
    let islandArchives = [];
    for (let i = 0; i < islandList.length; i++) {
        islandArchives.push(new ind.Archive());
    }
    
    let pops = [];
    
    for (let i = 0; i < islandEAOperators.length; i++) {
        

        console.log('Creating pop ' + i);
        let ops = islandEAOperators[i];
        let pop = [];
        let r = 3;
        let s = 0;
        let t = 5;
        let p = 1;
        let size = ops['selection'].args[1];
        
        let initModG = ops['decision'].op;
        let genomeArgs = ops['decision'].args;
        let initModH = ops['history'].op;
        let histArgs = ops['history'].args;
        for(let i = 0; i < size; i++) {
			let indiv = new ind.Individual();
			indiv.setGenome(initModG.execute(genomeArgs));
			indiv.setHist(initModH.execute(histArgs));
			indiv.setPayoffs(r, s, t, p);
			pop.push(indiv);
		}
        pops.push(pop);
    }
    
    console.log('pops');
    console.log(pops);
    
    let g = 0;
    
    // Prepare for evaluation
    
    console.log('resetting stats');
    for (let p = 0; p < pops.length; p++) {
        let pop = pops[p];
        for(let i = 0; i < pop.length; i++) {
            pop[i].resetStats();
        }
    }
    
    console.log('playing ipd');
    for (let p = 0; p < pops.length; p++) {
        let pop = pops[p];
        let archive = islandArchives[p];
        play.roundRobin([pop, 150]);
        archive.addPop(g, pop);
    }
    
    // Calculate statistics
    console.log('calculating stats');
    for (let p = 0; p < pops.length; p++) {
        let pop = pops[p];
        let archive = islandArchives[p];
        for(let i = 0; i < chartCount; i++) {
            let dataKeys = dataKeysMap[i];
            for(let dataKey in dataKeys) {
                archive.calculatePopDataStat(g, dataKey);
            }
        }
    }
    
    console.log('archives');
    console.log(islandArchives);
    
    popKeys.push(g);
    let datasetsMapList = [];
	let chartMapList = [];
	
    for (let p = 0; p < pops.length; p++) {
        let archive = islandArchives[p];
        let datasetsMap = {};
        let chartMap = {};
        for (let i = 0; i < chartCount; i++) {
            let dataKeys = dataKeysMap[i];
            for (let dataKey in dataKeys) {
                let datasets = createDatasets(archive, popKeys, dataKeys, i);
                
                datasetsMap[i] = datasets;
                
                
                let chart = createChart(datasets, popKeys, 'chart-' + i + '-' + p);
                
                chartMap[i] = chart;
                
            }
        }
        datasetsMapList.push(datasetsMap);
        chartMapList.push(chartMap);
    }
    
    console.log('datasets');
    console.log(datasetsMapList);
    
	g++;
    setTimeout(function() {
		$('#console').trigger('island-custom', [g, gens, pops, islandArchives, dataKeysMap, popKeys, datasetsMapList, chartMapList, islandEAOperators, migrateGens]);
	}, 10);
}

$('#run-island').click(function() {
    islandMain(); 
});

let islandList = [];
$('.ga-item-island').click(function() {
	let key = $(this).text();
	console.log('Adding in ' + key);
	gaOperators = createOperators(key);
	console.log(gaOperators);
	// Update HTML
	let phases = ['decision', 'history', 'crossover', 'mutation', 'selection', 'objective'];
	for(let i = 0; i < phases.length; i++) {
		let phase = phases[i];
		let op = gaOperators[phase].op;
		$('#' + phase + '-operator').empty();
		$('#' + phase + '-operator').html(op.getName());
	}
    
    // CONTINUE
    
    islandList.push({pos: islandList.length, key: key});    
    
    let numIslands = islandList.length-1;
    $('#islands').append(`
    <div id="island-${numIslands}">
        <h4>
            Island ${numIslands}
        </h4>
        <div class="form-group">
            <label for="migrate-${numIslands}">Island Rules: </label>
            <select class="form-control" id="island-ga-${numIslands}">
            </select>
        </div>
        <p id="selection-${numIslands}">Selection: <span id="sel-name-island-${numIslands}" class="migration">Blank Operator</span> </p>
        <p id="objective-${numIslands}">Objective: <span id="obj-name-island-${numIslands}" class="migration">Blank Operator</span> </p>
        <div class="form-group">
            <label for="migrate-${numIslands}">Select island to migrate to:</label>
            <select class="form-control" id="migrate-${numIslands}">
            </select>
        </div>
    </div>
    `);
    
    $(`#selection-${numIslands}`).click(function() {
        generateSelectionIsland(numIslands);
        //TODO AUTO FILL IN IF ALREADY CHOSEN
    });
    
    $(`#objective-${numIslands}`).click(function() {
        generateObjectiveIsland(numIslands);
        //TODO FILL IN IF ALREADY CHOSEN
    });
    
    
    
    for (let keyL in allGAs) {
        if (keyL == key) {
            $(`#island-ga-${numIslands}`).append(`<option selected value="${key}">${key}</option>`);
        } else {
            $(`#island-ga-${numIslands}`).append(`<option value="${keyL}">${keyL}</option>`);
        }
    }
    
    for (let i = 0; i < islandList.length; i++) {
        for (let j = 0; j < islandList.length; j++) {
            if (i == 0) {
                $(`#migrate-${j}`).empty();
            }
            $(`#migrate-${j}`).append(`<option value="${i}">Island ${i}</option>`);
        }
    }
    
    // Create a island box with name

    
});

$('#remove-last-island').click(function() {
    //remove html
    $(`#island-${islandList.length-1}`).remove();
    islandList.pop();
});




$("#ga-list-search").on("keyup", function() {
	var value = $(this).val().toLowerCase();
	$("#ga-list li").each(function() {
		let htmlText = $(this).text().toLowerCase();
		if(htmlText.includes(value)) {
			$(this).show();
		} else {
			$(this).hide();
		}
	});
});
$("#ga-list-search-island").on("keyup", function() {
	var value = $(this).val().toLowerCase();
	$("#ga-list-island li").each(function() {
		let htmlText = $(this).text().toLowerCase();
		if(htmlText.includes(value)) {
			$(this).show();
		} else {
			$(this).hide();
		}
	});
});
$("#strat-list-search-1").on("keyup", function() {
	var value = $(this).val().toLowerCase();
	$("#strat-list-1 li").each(function() {
		let htmlText = $(this).text().toLowerCase();
		if(htmlText.includes(value)) {
			$(this).show();
		} else {
			$(this).hide();
		}
	});
});
$("#strat-list-search-2").on("keyup", function() {
	var value = $(this).val().toLowerCase();
	$("#strat-list-2 li").each(function() {
		let htmlText = $(this).text().toLowerCase();
		if(htmlText.includes(value)) {
			$(this).show();
		} else {
			$(this).hide();
		}
	});
});

$("#strat-list-search-3").on("keyup", function() {
	var value = $(this).val().toLowerCase();
	$("#strat-list-3 li").each(function() {
		let htmlText = $(this).text().toLowerCase();
		if(htmlText.includes(value)) {
			$(this).show();
		} else {
			$(this).hide();
		}
	});
});
/* Chart Stuff */
function chartAdd(num) {
	let dataKeys = dataKeysMap[num];
	if(dataKeys == null) {
		dataKeys = {};
	}
	let colorIds = colorIdsMap[num];
	if(colorIds == null) {
		colorIds = [];
	}
	let attr = $(`#pop-attr-${num}`).val();
	let stat = $(`#pop-stat-${num}`).val();
	console.log(attr);
	console.log(stat);
	if(!(attr in dataKeys)) {
		dataKeys[attr] = [];
	}
	if(!dataKeys[attr].includes(stat)) {
		dataKeys[attr].push(stat);
	}
	let output = '';
	for(let key in dataKeys) {
		let data = dataKeys[key];
		for(let i = 0; i < data.length; i++) {
			let label = key + ': ' + data[i];
			let id = key + '-' + data[i] + '-color-' + num;
			output += `<p>${label} <input id=${id} type="color" value="#e66465"></p>`;
			colorIds.push(id);
		}
	}
	dataKeysMap[num] = dataKeys;
	colorIdsMap[num] = colorIds;
	$('#cur-chart-settings-' + num).html(output);
}

function chartClear(num) {
	dataKeysMap[num] = {};
	$('#cur-chart-settings-' + num).html('<p>' + JSON.stringify(dataKeysMap[num]) + '</p>');
}

$('#add-chart').click(function() {
	$('#charts').append(`
    <div id="chart-section-${chartCount}" class="row">
		<div id="chart-settings-${chartCount}">    
                <label for="pop-attr-${chartCount}">Population Attribute</label>
				<select name="pop-attr-${chartCount}" id="pop-attr-${chartCount}">
					<option value="selfScore">Self Score</option>
					<option value="oppScore">Opponent's Score</option>
					<option value="r">R Payoff</option>
					<option value="s">S Payoff</option>
					<option value="t">T Payoff</option>
					<option value="p">P Payoff</option>
                    <option value="selfBitUse">Self Bit Use</option>
                    <option value="difference">Score Difference</option>
                        <option value="win">Win</option>
                        <option value="tie">Tie</option>
                        <option value="loss">Loss</option>
                        <option value="node">Node</option>
                        <option value="edge">Edge</option>
				</select>
				<br>
				<label for="pop-stat-${chartCount}">Statistic</label>
				<select name="pop-stat-${chartCount}" id="pop-stat-${chartCount}">
					<option value="max">Max</option>
					<option value="min">Min</option>
					<option value="range">Range</option>
					<option value="midrange">Midrange</option>
					<option value="mean">Mean</option>
					<option value="sum">Sum</option>
					<option value="median">Median</option>
					<option value="variance">Variance</option>
					<option value="std">Standard Deviation</option>
				</select>
				<br> 
                <span class="btn btn-primary" onclick="chartAdd('${chartCount}');">Add</span> <span class="btn btn-primary"onclick="chartClear('${chartCount}');">Clear</span>
				<div id="cur-chart-settings-${chartCount}"> </div>
                <canvas id="chart-${chartCount}"></canvas>

		</div>
	</div>    
    `);
	chartCount += 1;
});
/* Export Stuff */ //
function exportToJson(objectData, name) {
	if(named != '') {
		name += '-' + named;
	}
	let filename = name + ".json";
	let contentType = "application/json;charset=utf-8;";
	if(window.navigator && window.navigator.msSaveOrOpenBlob) {
		var blob = new Blob([decodeURIComponent(encodeURI(JSON.stringify(objectData)))], {
			type: contentType
		});
		navigator.msSaveOrOpenBlob(blob, filename);
	} else {
		var a = document.createElement('a');
		a.download = filename;
		a.href = 'data:' + contentType + ',' + encodeURIComponent(JSON.stringify(objectData));
		a.target = '_blank';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
}

function exportToCsv(filename, rows) {
	var processRow = function(row) {
		var finalVal = '';
		for(var j = 0; j < row.length; j++) {
			var innerValue = row[j] === null ? '' : row[j].toString();
			if(row[j] instanceof Date) {
				innerValue = row[j].toLocaleString();
			};
			var result = innerValue.replace(/"/g, '""');
			if(result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
			if(j > 0) finalVal += ',';
			finalVal += result;
		}
		return finalVal + '\n';
	};
	var csvFile = '';
	for(var i = 0; i < rows.length; i++) {
		csvFile += processRow(rows[i]);
	}
	var blob = new Blob([csvFile], {
		type: 'text/csv;charset=utf-8;'
	});
	if(navigator.msSaveBlob) { // IE 10+
		navigator.msSaveBlob(blob, filename);
	} else {
		var link = document.createElement("a");
		if(link.download !== undefined) { // feature detection
			// Browsers that support HTML5 download attribute
			var url = URL.createObjectURL(blob);
			link.setAttribute("href", url);
			link.setAttribute("download", filename);
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}
}

function downloadPopJSON() {
	exportToJson(finalPop, 'population');
}
window.downloadPopJSON = downloadPopJSON;

function downloadIndJSON(num) {
	exportToJson(finalPop[num], 'individual-' + num);
}
window.downloadIndJSON = downloadIndJSON;

function downloadArchiveJSON() {
	exportToJson(finalArchive, 'archive');
}
window.downloadArchiveJSON = downloadArchiveJSON;
let showExportFlag = true;
$('#toggle-exports').click(function() {
	let eFinal = $('#final-exports');
	showExportFlag = !showExportFlag;
	if(showExportFlag) {
		eFinal.empty();
	} else {
		// Summary
		eFinal.append('<h3>Export Population</h3>');
		// Export archive to JSON
		// Export archive to CSV
		// Export population to JSON
		eFinal.append('<button onclick="downloadPopJSON()" id="download-pop-json">Download Population JSON</button><br>');
		eFinal.append('<button onclick="downloadArchiveJSON()" id="download-archive-json">Download Archive JSON</button>');
		// Export population to CSV
		eFinal.append('<h3>Export Individual</h3>');
		eFinal.append(`
    <table class="table">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Fitness</th>
      <th scope="col">Download</th>
    </tr>
  </thead>
  <tbody id="ind-table">

  </tbody>
</table>
    
    `);
		for(let i = 0; i < finalPop.length; i++) {
			// Individual
			$('#ind-table').append(`
        <tr>
            <td>${i}</td>
            <td>${finalPop[i].fitness}</td>
            <td><a href="#" onclick="downloadIndJSON(${i})">Download Individual ${i}</a></td>
        </tr>`);
			// Decision Bits
			// History Bits
			// Fitness
			// Export
			eFinal.append('');
		}
	}
});

function validateJSON(body) {
	try {
		var data = JSON.parse(body);
		// if came to here, then valid
		return data;
	} catch(e) {
		// failed to parse
		return null;
	}
}
let loadedIndividualsPop = [];
let indInputPosPop = 0;
$('#load-individuals-pop').click(async function() {
	let indInput = $('#ind-in-pop').prop('files');
	indInputPosPop = 0;
	let reader = new FileReader();
	// event fired when file reading finished
	reader.addEventListener('load', function(e) {
		// contents of the file	    
		if(validateJSON(e.target.result)) {
			console.log(indInput[indInputPosPop].name.split('.')[0]);
			let content = JSON.parse(e.target.result);
			if(Array.isArray(content)) {
				for(let i = 0; i < content.length; i++) {
					if(content[i].hasOwnProperty('genome') && content[i].hasOwnProperty('hist')) {
						let indInstance = Object.assign(new ind.Individual(), content[i]);
						let evolvedStrat = new strat.EvolvedStrategy(indInstance.genome, indInstance.hist, indInput[indInputPos].name.split('.')[0] + ' ' + i);
						loadedIndividualsPop.push(evolvedStrat);
					}
				}
			} else {
				if(content.hasOwnProperty('genome') && content.hasOwnProperty('hist')) {
					let indInstance = Object.assign(new ind.Individual(), content);
					let evolvedStrat = new strat.EvolvedStrategy(indInstance.genome, indInstance.hist, indInput[indInputPos].name.split('.')[0]);
					loadedIndividualsPop.push(evolvedStrat);
				}
			}
			$('#load-out').append('<p>Loaded ' + loadedIndividualsPop.length + ' individual(s)</p>');
			indInputPosPop += 1;
			if(indInputPosPop < indInput.length) {
				reader.readAsText(indInput[indInputPosPop]);
			} else {
				$('#load-out-pop').append('<p>Finished loading</p>');
				console.log('Loaded:');
				console.log(loadedIndividualsPop);
			}
		} else {
			console.log('parsed something NOT JSON');
		}
	});
	reader.readAsText(indInput[indInputPos]);
});
$('#remove-load-individuals-pop').click(function() {
	loadedIndividualsPop = [];
	$('#load-out-pop').empty();
	$('#list-loaded-pop').empty();
});
/* Evaluation */
let loadedIndividuals = [];
let indInputPos = 0;
$('#load-individuals').click(async function() {
	let indInput = $('#ind-in').prop('files');
	indInputPos = 0;
	let reader = new FileReader();
	// event fired when file reading finished
	reader.addEventListener('load', function(e) {
		// contents of the file	    
		if(validateJSON(e.target.result)) {
			console.log(indInput[indInputPos].name.split('.')[0]);
			let content = JSON.parse(e.target.result);
			if(Array.isArray(content)) {
				for(let i = 0; i < content.length; i++) {
					if(content[i].hasOwnProperty('genome') && content[i].hasOwnProperty('hist')) {
						let indInstance = Object.assign(new ind.Individual(), content[i]);
						let evolvedStrat = new strat.EvolvedStrategy(indInstance.genome, indInstance.hist, indInput[indInputPos].name.split('.')[0] + ' ' + i);
						loadedIndividuals.push(evolvedStrat);
					}
				}
			} else {
				if(content.hasOwnProperty('genome') && content.hasOwnProperty('hist')) {
					let indInstance = Object.assign(new ind.Individual(), content);
					let evolvedStrat = new strat.EvolvedStrategy(indInstance.genome, indInstance.hist, indInput[indInputPos].name.split('.')[0]);
					loadedIndividuals.push(evolvedStrat);
				}
			}
			$('#load-out').append('<p>Loaded ' + loadedIndividuals.length + ' individual(s)</p>');
			indInputPos += 1;
			if(indInputPos < indInput.length) {
				reader.readAsText(indInput[indInputPos]);
			} else {
				$('#load-out').append('<p>Finished loading</p>');
			}
		} else {
			console.log('parsed something NOT JSON');
		}
	});
	reader.readAsText(indInput[indInputPos]);
});
$('#remove-load-individuals').click(function() {
	loadedIndividuals = [];
	$('#load-out').empty();
	$('#list-loaded').empty();
});
console.log('Axelrod Strategies');
console.log(axelrod);
let axelrodStrategies = [];
for(let as in axelrod) {
	let asClass = axelrod[as];
	axelrodStrategies.push(axelrod[as]);
	let asInstance = new asClass();
	$('#list-axelrod').append(`<li class="list-group-item"><span style="margin-left: 10px;"><input class="form-check-input" type="checkbox" value="" id="check-axelrod-${as}">${asInstance.getName()} <svg id="${as}-i" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16" data-toggle="tooltip" data-placement="right" 
        title="${asInstance.getDescription()}">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
</svg></span></li>`);
	$(`#${as}-i`).tooltip();
	$('#strat-list-1').append(`<li class="list-group-item list-group-item-action strat-item-1"><span>${asInstance.getName()}</span></li>`);
	$('#strat-list-2').append(`<li class="list-group-item list-group-item-action strat-item-2"><span>${asInstance.getName()}</span></li>`);
    $('#strat-list-3').append(`<li class="list-group-item list-group-item-action strat-item-3"><span>${asInstance.getName()}</span></li>`);

    //$('#ga-list').append('<li class="list-group-item list-group-item-action ga-item"><span>'+key+'</span></li>');
}
let strat1 = null;
$('body').on('click', '.strat-item-1', function() {
	let key = $(this).text();
	console.log(key);
	let flag = false;
	for(let i = 0; i < axelrodStrategies.length; i++) {
		let s = new axelrodStrategies[i]();
		if(s.getName() == key) {
			flag = true;
			strat1 = new axelrodStrategies[i]();
			$('#strat-1').html(key);
			break;
		}
	}
	if(!flag) {
		for(let i = 0; i < loadedIndividuals.length; i++) {
			let s = loadedIndividuals[i];
			console.log('testing ' + s.getName() + ' against ' + key);
			if(s.getName() == key) {
				flag = true;
				strat1 = new strat.EvolvedStrategy(s.genome, s.hist, s.name);
				$('#strat-1').html(strat1.getName());
				$('#strat-1').html(key);
				break;
			}
		}
	}
});
let strat2 = null;
$('body').on('click', '.strat-item-2', function() {
	let key = $(this).text();
	let flag = false;
	for(let i = 0; i < axelrodStrategies.length; i++) {
		let s = new axelrodStrategies[i]();
		if(s.getName() == key) {
			flag = true;
			strat2 = new axelrodStrategies[i]();
			$('#strat-2').html(key);
			break;
		}
	}
	if(!flag) {
		for(let i = 0; i < loadedIndividuals.length; i++) {
			let s = loadedIndividuals[i];
			if(s.getName() == key) {
				flag = true;
				strat2 = new strat.EvolvedStrategy(s.genome, s.hist, s.name);
				$('#strat-2').html(strat1.getName());
				$('#strat-2').html(key);
				break;
			}
		}
	}
});

let strat3 = null;
let evalSelfScore = 0;
let evalOppScore = 0;
let round = 0;

function updatePlayNetwork() {
    let result = strat3.getGraph(3);
	let nodes = result[0];
	let edges = result[1];
	$('#play-network').remove(); // this is my <canvas> element
	$('#play-network-container').append('<div style="width: 100%; height: 400px" id="play-network"><div>');
	// create a network
	let container = document.getElementById("play-network");
	let data = {
		nodes: nodes,
		edges: edges,
	};
	let options = {};
	let network = new vis.Network(container, data, options);
}

function updateBarPayoffs() {
    $('#play-bar').remove(); // this is my <canvas> element
	$('#play-bar-container').append('<canvas id="play-bar"><canvas>');
    let ctxBar = $('#play-bar')[0].getContext('2d');
    
    let payoffs = strat3.getGamePayoffs();
    
	let barData = {
		labels: ['R', 'P', 'S', 'T'],
		datasets: [{
			label: strat3.getName(),
			data: payoffs,
			fill: true,
			backgroundColor: `rgba(${rgb1[0]}, ${rgb1[1]}, ${rgb1[2]}, 0.2)`,
			borderColor: `rgb(${rgb1[0]}, ${rgb1[1]}, ${rgb1[2]})`,
			pointBackgroundColor: `rgb(${rgb1[0]}, ${rgb1[1]}, ${rgb1[2]})`,
			pointBorderColor: '#fff',
			pointHoverBackgroundColor: '#fff',
			pointHoverBorderColor: `rgb(${rgb1[0]}, ${rgb1[1]}, ${rgb1[2]})`,
		}]
    };
	let barConfig = {
		type: 'bar',
		data: barData,
		options: {
			elements: {
				line: {
					borderWidth: 3
				}
			},
            scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        },
            ticks: {
                stepSize: 5,
                min: 0,
                max: 150,
            },
            tooltips: {
        	mode: 'label'
        },
            
		},
	};
	let barChart = new Chart(ctxBar, barConfig);
}

function updateScorePlay() {
    $('#play-score').remove(); // this is my <canvas> element
	$('#play-score-container').append('<canvas id="play-score"><canvas>');
    let ctxScore = $('#play-score')[0].getContext('2d');
    
    let scores = strat3.getScoreList();
    
	let dataScores = [];
	for(let i = 0; i < scores.length; i++) {
		dataScores.push({
			x: i,
			y: scores[i]
		});
	}
	let ctx = $('#play-score')[0].getContext('2d');
	let dataSetScores = {
		label: strat3.getName(),
		fill: false,
		data: dataScores,
		borderColor: `rgb(${rgb1[0]}, ${rgb1[1]}, ${rgb1[2]})`
	};

	let dataSetsScores = [dataSetScores];
	let scoreChart = new Chart(ctxScore, {
		type: 'scatter',
		data: {
			datasets: dataSetsScores
		},
	});
}

$('body').on('click', '.strat-item-3', function() {
	let key = $(this).text();
	console.log(key);
	let flag = false;
	for(let i = 0; i < axelrodStrategies.length; i++) {
		let s = new axelrodStrategies[i]();
		if(s.getName() == key) {
			flag = true;
			strat3 = new axelrodStrategies[i]();
			$('#strat-3').html(key);
			break;
		}
	}
	if(!flag) {
		for(let i = 0; i < loadedIndividuals.length; i++) {
			let s = loadedIndividuals[i];
			console.log('testing ' + s.getName() + ' against ' + key);
			if(s.getName() == key) {
				flag = true;
				strat3 = new strat.EvolvedStrategy(s.genome, s.hist, s.name);
				$('#strat-3').html(strat3.getName());
				$('#strat-3').html(key);
				break;
			}
		}
	}
    if (flag) {
        evalSelfScore = 0;
        evalOppScore = 0;
        round = 0;
        strat3.trueInit();
        strat3.trueReinit();
        
        let divName = 'interact-ipd'
        let playDiv = $('#' + divName);        
        playDiv.empty();
        playDiv.append('<p>Your Score: <span id="' + divName + '-score-player">0</span></p>');
        playDiv.append('<p>' + strat3.getName() + '\'s Score: <span id="' + divName + '-score-opp">0</span></p>');
        playDiv.append('<p>Round: <span id="' + divName + '-round">0</span></p>');
        playDiv.append('<p>Past Rounds:</p>');
        playDiv.append('<div style="height: 120px;"id="memory-ipd" class="overflow-auto" style="overflow: scroll;"></div>');
        //overflow-auto

        playDiv.append(`
        
        <div style="margin-bottom: 10px; margin-top: 10px;">
        <button style="margin-right: 20px;" type="button" id="c-move" class="btn btn-primary">Cooperate</button>
        <button type="button" id="d-move" class="btn btn-primary">Defect</button>
        </div>
        <h3>Game States from ${strat3.getName()}'s Perspective</h3>
        <div id="play-network-container"></div>
        <div id="play-score-container"></div>
        <div id="play-bar-container"></div>
        
        `);
        
        
        $('#c-move').click(function(){
            round++;
            let d1 = strat3.generateMove();
            let d2 = 0;
            let data1 = {
                selfMove: d1,
                oppMove: d2
            };
            let s = 'C';
            if (d1 === 1) {
                s = 'D';
            }
            strat3.update(data1, 'Human');
            
            let payoffS = 'R';
            if (d1 == 0 && d2 == 0) {
                // Cooperate

                evalOppScore += 3;
                evalSelfScore += 3;
            } else if (d1 == 1 && d2 == 0) {
                evalOppScore += 5;
                evalSelfScore += 0;
                payoffS = 'S';
            } else if (d1 == 1 && d2 == 1) {
                evalOppScore += 1;
                evalSelfScore += 1;
                payoffS = 'P';
            } else if (d1 == 0 && d2 == 1) {
                evalOppScore += 0;
                evalSelfScore += 5;
                payoffS = 'T';
            }
            
            $('#memory-ipd').append('<p>Round ' + round + ': C' + s + '=>' + payoffS + '</p>');
            $('#' + divName + '-score-player').html(evalSelfScore);
            $('#' + divName + '-score-opp').html(evalOppScore);
            
            $('#' + divName + '-round').html(round);
            updatePlayNetwork();
            updateScorePlay();
            updateBarPayoffs();
            $('#memory-ipd').scrollTop($('#memory-ipd').prop('scrollHeight'));
        });

        $('#d-move').click(function(){
            round++;
            let d1 = strat3.generateMove();
            let d2 = 1;
            let data1 = {
                selfMove: d1,
                oppMove: d2
            };
            let s = 'C';
            if (d1 === 1) {
                s = 'D';
            }
            strat3.update(data1, 'Human');
            let payoffS = 'R';
            if (d1 == 0 && d2 == 0) {
                // Cooperate

                evalOppScore += 3;
                evalSelfScore += 3;
            } else if (d1 == 1 && d2 == 0) {
                evalOppScore += 5;
                evalSelfScore += 0;
                payoffS = 'S';
            } else if (d1 == 1 && d2 == 1) {
                evalOppScore += 1;
                evalSelfScore += 1;
                payoffS = 'P';
            } else if (d1 == 0 && d2 == 1) {
                evalOppScore += 0;
                evalSelfScore += 5;
                payoffS = 'T';
            }
            
            $('#memory-ipd').append('<p>Round ' + round + ': D' + s + '=>' + payoffS + '</p>');

            $('#' + divName + '-score-player').html(evalSelfScore);
            $('#' + divName + '-score-opp').html(evalOppScore);
            
            $('#' + divName + '-round').html(round);
            updatePlayNetwork();
            updateScorePlay();
            updateBarPayoffs();
            $('#memory-ipd').scrollTop($('#memory-ipd').prop('scrollHeight'));
        });
        
    }
});

// Loaded
$('#select-axelrod').click(function() {
	for(let i = 0; i < axelrodStrategies.length; i++) {
		let asClass = axelrodStrategies[i];
		let asInstance = new asClass();
		let as = asInstance.constructor.name;
		let checkId = '#check-axelrod-' + as;
		$(checkId).prop('checked', true);
	}
});
$('#deselect-axelrod').click(function() {
	for(let i = 0; i < axelrodStrategies.length; i++) {
		let asClass = axelrodStrategies[i];
		let asInstance = new asClass();
		let as = asInstance.constructor.name;
		let checkId = '#check-axelrod-' + as;
		$(checkId).prop('checked', false);
	}
});
$('#refresh-loaded').click(function() {
	$('#list-loaded').empty();
    $('#strat-list-1').empty();
    $('#strat-list-2').empty();
    $('#strat-list-3').empty();
	for(let i = 0; i < loadedIndividuals.length; i++) {
		console.log('Ind');
		let evInstance = loadedIndividuals[i];
		$('#list-loaded').append(`<li class="list-group-item"><span style="margin-left: 10px;"><input class="form-check-input" type="checkbox" value="" id="check-evolved-${i}">${evInstance.getName()}</span></li>`);
		$('#strat-list-1').append(`<li class="list-group-item list-group-item-action strat-item-1"><span>${evInstance.getName()}</span></li>`);
		$('#strat-list-2').append(`<li class="list-group-item list-group-item-action strat-item-2"><span>${evInstance.getName()}</span></li>`);
		$('#strat-list-3').append(`<li class="list-group-item list-group-item-action strat-item-3"><span>${evInstance.getName()}</span></li>`);
	
    }
    axelrodStrategies = [];
    for (let as in axelrod) {
        let asClass = axelrod[as];
        axelrodStrategies.push(axelrod[as]);
        let asInstance = new asClass();
	
        $('#strat-list-1').append(`<li class="list-group-item list-group-item-action strat-item-1"><span>${asInstance.getName()}</span></li>`);
        $('#strat-list-2').append(`<li class="list-group-item list-group-item-action strat-item-2"><span>${asInstance.getName()}</span></li>`);
        $('#strat-list-3').append(`<li class="list-group-item list-group-item-action strat-item-3"><span>${asInstance.getName()}</span></li>`);
    }
});
$('#select-loaded').click(function() {
	for(let i = 0; i < loadedIndividuals.length; i++) {
		let checkId = '#check-evolved-' + i;
		$(checkId).prop('checked', true);
	}
});
$('#deselect-loaded').click(function() {
	for(let i = 0; i < loadedIndividuals.length; i++) {
		let checkId = '#check-evolved-' + i;
		$(checkId).prop('checked', false);
	}
});
$('#toggle-loaded').click(function() {
	$('#list-loaded').toggle();
});
// Display strategies
function evalPlay(s1, s2) {
	console.log(s1.getName() + ' VS ' + s2.getName());
	s1.trueReinit();
	s2.trueReinit();
	for(let i = 0; i < 150; i++) {
		let d1 = s1.generateMove();
		let d2 = s2.generateMove();
		let data1 = {
			selfMove: d1,
			oppMove: d2
		};
		let data2 = {
			selfMove: d2,
			oppMove: d1
		};
		s1.update(data1, s2.getName());
		s2.update(data2, s1.getName());
	}
	console.log(s1.getName() + ': ' + s1.score);
	console.log(s2.getName() + ': ' + s2.score);
	s1.endGame();
	s2.endGame();
}
let strategies = [];
$('#eval-individuals').click(function() {
	let dup = $('#tourn-duplicate').prop('checked');
    console.log('dup');
    console.log(dup);
	strategies = [];
	for(let i = 0; i < axelrodStrategies.length; i++) {
		let asClass = axelrodStrategies[i];
		let asInstance = new asClass();
		let as = asInstance.constructor.name;
		let checkId = '#check-axelrod-' + as;
		if($(checkId).prop('checked')) {
            console.log('i: ' + i);
            console.log(asInstance.getName());
			strategies.push(asInstance);
			if(dup) {
				let copyInstance = new asClass();
				copyInstance.name += ' (2)';
				strategies.push(copyInstance);
			}
		}
	}
	for(let i = 0; i < loadedIndividuals.length; i++) {
		console.log('Ind');
		console.log(loadedIndividuals[i]);
		let evInstance = loadedIndividuals[i];
		let checkId = '#check-evolved-' + i;
		if($(checkId).prop('checked')) {
			strategies.push(evInstance);
            if(dup) {
                console.log('COL');
				strategies.push(evInstance.getCopy());
			}
		}
	}
	console.log('Players');
	for(let i = 0; i < strategies.length; i++) {
		console.log(strategies[i].getName());
	}
	if(strategies.length < 2) {
		alert('At least 2 strategies must be playing!');
		console.log('Needs more players!');
		return;
	}
	for(let i = 0; i < strategies.length - 1; i++) {
		for(let j = i + 1; j < strategies.length; j++) {
			evalPlay(strategies[i], strategies[j]);
		}
	}
	$('#eval-results').empty();
    $('#eval-results').append('<a href="#tournament-csv">Jump to Export Evaluation</a>');
    let scoresData = [];
	for(let i = 0; i < strategies.length; i++) {
        
		console.log(strategies[i].getName());
		$('#eval-results').append('<h4>' + strategies[i].getName() + '</h4>');
		$('#eval-results').append(`<h5>Game Stats</h5>
        <span>Toggle Table </span><svg id="hide-table-${i}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-up-fill" viewBox="0 0 16 16">
  <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
</svg><svg id="show-table-${i}" style="display:none;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-down-fill" viewBox="0 0 16 16">
  <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
</svg>`);
		$('#eval-results').append(`<table class="table" id="result-table-${i}">
  <thead>
    <tr>
      <th scope="col">Data</th>
      <th scope="col">Mean per Round</th>

      <th scope="col">Mean</th>
      <th scope="col">Standard Deviation</th>
    </tr>
  </thead>
  <tbody></tbody></table>`);
		strategies[i].generateStats();
		let dataKeys = ['r', 's', 't', 'p', 'selfScore', 'oppScore', 'win', 'tie', 'loss', 'difference', 'node', 'edge'];
		for(let j = 0; j < dataKeys.length; j++) {
			$('#result-table-' + i).append(`<tr>
      <th class="row">${dataKeys[j]}</td>
      <td>${strategies[i].stats[dataKeys[j]].getAttr('mean')/150}</td>
      <td>${strategies[i].stats[dataKeys[j]].getAttr('mean')}</td>
      <td>${strategies[i].stats[dataKeys[j]].getAttr('std')}</td>
    </tr>`);
        $(`#hide-table-${i}`).click(function() {
            $(`#result-table-${i}`).hide();
            $(`#hide-table-${i}`).hide();
            $(`#show-table-${i}`).show();
        });
        $(`#show-table-${i}`).click(function() {
            $(`#result-table-${i}`).show();
            $(`#hide-table-${i}`).show();
            $(`#show-table-${i}`).hide();
        });
			console.log(dataKeys[j]);
			console.log(strategies[i].stats[dataKeys[j]]);
		}
        scoresData.push({
            x: strategies[i].stats['selfScore'].getAttr('mean'), 
            y: strategies[i].stats['oppScore'].getAttr('mean'),
            name: strategies[i].getName()
        });
	}
    $('#eval-results').append('<canvas id="score-chart"></canvas>');
    	let ctxScores = $('#score-chart')[0].getContext('2d');

    let dataScores = {
  datasets: [{
    label: 'Self Score vs Opp Score',
    data: scoresData,
    backgroundColor: 'rgb(255, 99, 132)'
  }],
};

let configScores = {
  type: 'scatter',
  data: dataScores,
  options: {
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
                display: true,
                text: 'Mean Self Score'
            }
      },
      y: {
        type: 'linear',
        position: 'left',
        title: {
                display: true,
                text: 'Mean Opponent Score'
            }
      }
    },
    plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.raw.name}: (${context.raw.x.toFixed(2)}, ${context.raw.y.toFixed(2)})`;
                    }
                }
            }
        }
  }
};
	let scoreChart = new Chart(ctxScores, configScores);

    console.log('end');
});
$('#tournament-csv').click(function() {
	let rows = [];
	let dataKeys = ['r', 's', 't', 'p', 'selfScore', 'oppScore', 'win', 'tie', 'loss', 'difference', 'edge', 'node'];
	let statKeys = ['max', 'min', 'range', 'midrange', 'mean', 'sum', 'median', 'variance', 'std', 'raw'];
	let header = ['algorithm_name', 'data_name', 'max', 'min', 'range', 'midrange', 'mean', 'sum', 'median', 'variance', 'std', 'raw'];
	rows.push(header);
	for(let i = 0; i < strategies.length; i++) {
		let s = strategies[i];
		let algorithm_name = s.getName();
		for(let j = 0; j < dataKeys.length; j++) {
			let data_name = dataKeys[j];
			let stats = s.stats[data_name]
			let r = [algorithm_name, data_name];
			for(let k = 0; k < statKeys.length; k++) {
				let statKey = statKeys[k];
				if(statKey == 'raw') {
					r.push(stats.getAttr('raw').join(','));
				} else {
					r.push(stats.getAttr(statKey));
				}
			}
			rows.push(r);
		}
	}
	exportToCsv('evaluation.csv', rows);
});

function addData(chart, label, data) {
	chart.data.labels.push(label);
	chart.data.datasets.forEach((dataset) => {
		dataset.data.push(data);
	});
	chart.update();
}

function removeData(chart) {
	chart.data.labels.pop();
	chart.data.datasets.forEach((dataset) => {
		dataset.data.pop();
	});
	chart.update();
}
$('#run-match').click(function() {
    
    
	console.log('size');
	let size = parseInt($('#state-size').val());
	console.log(size);
	if(size == 0 || size > 6) {
		alert('The state size must be an integer greater than 0 and less than 7');
		return;
	}
	if(strat1 == null) {
		console.log('strat1 is not set');
		return;
	}
	if(strat2 == null) {
		console.log('strat2 is not set');
		return;
	}
	console.log('Runing match...');
    strat1.trueInit();
    strat2.trueInit();
	evalPlay(strat1, strat2);
	let result = strat1.getGraph(size);
	let nodes = result[0];
	let edges = result[1];
	$('#network').remove(); // this is my <canvas> element
	$('#network-container').append('<div style="width: 100%; height: 400px" id="network"><div>');
	// create a network
	let container = document.getElementById("network");
	let data = {
		nodes: nodes,
		edges: edges,
	};
	let options = {};
	let network = new vis.Network(container, data, options);
	let scores1 = strat1.getScoreList();
	let scores2 = strat2.getScoreList();
	console.log('scores');
	console.log(scores1);
	console.log(scores2);
	let data1 = [];
	let data2 = [];
	for(let i = 0; i < scores1.length; i++) {
		data1.push({
			x: i,
			y: scores1[i]
		});
		data2.push({
			x: i,
			y: scores2[i]
		});
	}
    $('#match-chart-container').empty();
	$('#match-chart-container').append(`<h3>Score Over Time <svg id="match-chart-i" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16" data-toggle="tooltip" data-placement="right" 
        title="View the scores of ${strat1.getName()} and ${strat2.getName()} over the rounds of the match.">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
</svg></h3><canvas id="match-chart"></canvas>`);
    $('#match-chart-i').tooltip();
	let ctx = $('#match-chart')[0].getContext('2d');
	let dataSet1 = {
		label: strat1.getName(),
		fill: false,
		data: data1,
		borderColor: `rgb(${rgb1[0]}, ${rgb1[1]}, ${rgb1[2]})`
	};
	let dataSet2 = {
		label: strat2.getName(),
		fill: false,
		data: data2,
		borderColor: `rgb(${rgb2[0]}, ${rgb2[1]}, ${rgb2[2]})`
	};
	let matchDataSets = [dataSet1, dataSet2];
	let matchChart = new Chart(ctx, {
		type: 'scatter',
		data: {
			datasets: matchDataSets
		},
	});
	$('#match-chart-container').append(`<h3>Comparison of Payoffs Received <svg id="match-chart-radar-i" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16" data-toggle="tooltip" data-placement="right" 
        title="View the payoffs of ${strat1.getName()} and ${strat2.getName()} in a radar chart.">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
</svg></h3><canvas id="match-chart-radar"></canvas>`);
    $('#match-chart-radar-i').tooltip();

	let ctxRadar = $('#match-chart-radar')[0].getContext('2d');
    
    let gamePayoffs1 = strat1.getGamePayoffs();
    console.log(gamePayoffs1);
    let gamePayoffs2 = strat2.getGamePayoffs();
    console.log(gamePayoffs2);
    
	let radarData = {
		labels: ['R', 'P', 'S', 'T'],
		datasets: [{
			label: strat1.getName(),
			data: gamePayoffs1,
			fill: true,
			backgroundColor: `rgba(${rgb1[0]}, ${rgb1[1]}, ${rgb1[2]}, 0.2)`,
			borderColor: `rgb(${rgb1[0]}, ${rgb1[1]}, ${rgb1[2]})`,
			pointBackgroundColor: `rgb(${rgb1[0]}, ${rgb1[1]}, ${rgb1[2]})`,
			pointBorderColor: '#fff',
			pointHoverBackgroundColor: '#fff',
			pointHoverBorderColor: `rgb(${rgb1[0]}, ${rgb1[1]}, ${rgb1[2]})`,
		}, {
			label: strat2.getName(),
			data: gamePayoffs2,
			fill: true,
			backgroundColor: `rgba(${rgb2[0]}, ${rgb2[1]}, ${rgb2[2]}, 0.2)`,
			borderColor: `rgb(${rgb2[0]}, ${rgb2[1]}, ${rgb2[2]})`,
			pointBackgroundColor: `rgb(${rgb2[0]}, ${rgb2[1]}, ${rgb2[2]})`,
			pointBorderColor: '#fff',
			pointHoverBackgroundColor: '#fff',
			pointHoverBorderColor: `rgb(${rgb2[0]}, ${rgb2[1]}, ${rgb2[2]})`,
		}]
	};
	let configRadar = {
		type: 'bar',
		data: radarData,
		options: {
			elements: {
				line: {
					borderWidth: 3
				}
			},
            scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        },
            ticks: {
                stepSize: 5,
                min: 0,
                max: 150,
            },
            tooltips: {
        	mode: 'label'
        },
            
		},
	};
	let radarChart = new Chart(ctxRadar, configRadar);
});
//var 
window.chart = chart;
window.display = display;
window.main = main;
window.newMain = newMain;
window.initPop = initPop;
window.evolve = evolve;
window.gotClick = gotClick;
window.chartAdd = chartAdd;
window.chartClear = chartClear;
window.start = start;
window.selIslandClick = selIslandClick;
window.objIslandClick = objIslandClick;
/*

Ensure the technologies and WHY
Why did you choose this or that...? Why did you make a paritucular decision?

How does it work in more detail?
How much did you really implement?
?s not to try to get you.
Kasi and Zheng will ask software engineering questions, security - KNOW YOU THOUGHT ABOUT IT
How you used the software life cylce model. Was it good not good? What would you do differently?
Particular slides (NUMBER YOUR SLIDES)

JSauppe - Decision


Attend one before your presentation.

*/