import * as Init from './modules/initialization.js';
import * as Mutate from './modules/mutate.js';
import * as Crossover from './modules/crossover.js';
import * as Objective from './modules/objective.js';
import * as Selection from './modules/selection.js';
import * as Partition from './modules/partition.js';
import * as Play from './modules/play.js';
//import * as Regression from '../regression.js';

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
$( "#console" ).on( "custom", function( event, g ) {
	evolve(g);
});

/*
 * Guassian Probability Distribution
 * fitter.py
 * Identify your data's distribution
 * Regression JS
 * curve fitter
 * tensor flow
 * song chen
 */