import React from "react";
import shared from "../Shared";
import Chance from "chance";
import clone from "clone";

const chance = new Chance();


// all the possible charts to roll on
// charts must supply an array of max/result values in ascending order
const charts = {};

// an injury has occurred
// params: offense/defense, run/pass
charts.injury = {
	table: {
		[shared.consts.positionTypes.offense]: {
			[shared.consts.playTypes.pass]: [
				{max: 30, result: 'QB'},
				{max: 60, result: 'WR'},
				{max: 70, result: 'RB'},
				{max: 80, result: 'OL'},
				{max: 100, result: 'FB'},
			],
			[shared.consts.playTypes.run]: [
				{max: 10, result: 'QB'},
				{max: 15, result: 'WR'},
				{max: 65, result: 'RB'},
				{max: 85, result: 'OL'},
				{max: 100, result: 'FB'},
			],
		},
		[shared.consts.positionTypes.defense]: {
			[shared.consts.playTypes.pass]: [
				{max: 10, result: 'DL'},
				{max: 30, result: 'LB'},
				{max: 65, result: 'CB'},
				{max: 100, result: 'S'},
			],
			[shared.consts.playTypes.run]: [
				{max: 35, result: 'DL'},
				{max: 70, result: 'LB'},
				{max: 90, result: 'CB'},
				{max: 100, result: 'S'},
			],
		},
		// special is weird because it doesn't matter run/pass, but if the roll is for offense/defense
	},
	// fields to show on the chart editor in order of how they are passed when rolling
	fields: [
		{var: 'positionType', label: 'Position Type (Offense/Defense/Special)', options: ['Offense', 'Defense',]},
		{var: 'playType', label: 'Play Type (run/pass)', options: ['run', 'pass']},
	],
	description: 'Check if an injury occurs. If occurred, then roll a d12 for severity. Each quarter of the game, roll a d4 for each injured player and subtract that much from their injury rating. This way you know severity of injury, but not full time frame of when they will return.'
};

function rollChart(chart) {
	// what is the max max for this chart?
	const max = chart[chart.length - 1].max;

	// get a random result
	const roll = chance.integer({min: 1, max: max});

	// find which results are <= roll
	let i = 0;
	while (chart[i++].max < roll);
	const lessThan = chart.slice(0, i);

	// assumes records remain in the same order after filtering, so grab greatest one
	return lessThan[lessThan.length - 1].result;
}

export default {
	injury: (positionType, playType) => rollChart(charts.injury[positionType][playType]),

	// clone so outside world can't mess with inside world
	charts: clone(charts),

	// allows rolling a chart
	rollChart: rollChart,
};