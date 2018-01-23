import React from "react";
import shared from "../Shared";
import Chance from "chance";
import clone from "clone";

const chance = new Chance();


// all the possible charts to roll on
// charts must supply an array of max/result values in ascending order
const charts = {};


// how long, on average, is a player's career
charts.averageCareer = {
	table: {
		[shared.consts.position.QB]: [{max: 1, result: 5}],
		[shared.consts.position.WR]: [{max: 1, result: 3}],
		[shared.consts.position.RB]: [{max: 1, result: 2}],
		[shared.consts.position.FB]: [{max: 1, result: 3}],
		[shared.consts.position.OL]: [{max: 1, result: 4}],
		[shared.consts.position.DL]: [{max: 1, result: 3}],
		[shared.consts.position.LB]: [{max: 1, result: 3}],
		[shared.consts.position.CB]: [{max: 1, result: 3}],
		[shared.consts.position.S]: [{max: 1, result: 3}],
		[shared.consts.position.P]: [{max: 1, result: 6}],
		[shared.consts.position.K]: [{max: 1, result: 6}],
	},
	fields: [
		{var: 'position', options: shared.consts.positions}
	],
	description: 'How long is a player type career on average. The results are not random.',
};

// Should a player upgrade be applied to run or pass?
charts.upgradePlayType = {
	table: {
		[shared.consts.position.QB]: [
			{max: 50, result: shared.consts.playTypes.run},
			{max: 100, result: shared.consts.playTypes.pass},
		],
		[shared.consts.position.WR]: [
			{max: 25, result: shared.consts.playTypes.run},
			{max: 100, result: shared.consts.playTypes.pass},
		],
		[shared.consts.position.WR]: [
			{max: 75, result: shared.consts.playTypes.run},
			{max: 100, result: shared.consts.playTypes.pass},
		],
		[shared.consts.position.OL]: [
			{max: 50, result: shared.consts.playTypes.run},
			{max: 100, result: shared.consts.playTypes.pass},
		],
		[shared.consts.position.FB]: [
			{max: 75, result: shared.consts.playTypes.run},
			{max: 100, result: shared.consts.playTypes.pass},
		],
		[shared.consts.position.DL]: [
			{max: 50, result: shared.consts.playTypes.run},
			{max: 100, result: shared.consts.playTypes.pass},
		],
		[shared.consts.position.LB]: [
			{max: 50, result: shared.consts.playTypes.run},
			{max: 100, result: shared.consts.playTypes.pass},
		],
		[shared.consts.position.CB]: [
			{max: 25, result: shared.consts.playTypes.run},
			{max: 100, result: shared.consts.playTypes.pass},
		],
		[shared.consts.position.S]: [
			{max: 15, result: shared.consts.playTypes.run},
			{max: 100, result: shared.consts.playTypes.pass},
		],
		[shared.consts.position.K]: [
			{max: 1, result: shared.consts.playTypes.special},
		],
		[shared.consts.position.P]: [
			{max: 1, result: shared.consts.playTypes.special},
		],
	},
	fields: [
		{var: 'position', options: shared.consts.positions}
	],
	description: 'Should an upgrade to a stat be applied to run or to pass?',
};

// how strong of an upgrade does the player get?
charts.upgradeLevel = {
	table: [
		{max: 5, result: {level: 1, roll: 4, numberStats: 2,}},
		{max: 10, result: {level: 2, roll: 4, numberStats: 1,}},
		{max: 25, result: {level: 3, roll: 3, numberStats: 2,}},
		{max: 40, result: {level: 4, roll: 3, numberStats: 1,}},
		{max: 70, result: {level: 5, roll: 2, numberStats: 2,}},
		{max: 100, result: {level: 6, roll: 2, numberStats: 1,}},
	],
	fields: [],
	description: 'Determine upgrade level for a player. Useful when drafting or rolling upgrades.',
};

// an injury has occurred
// params: offense/defense, run/pass
charts.injury = {
	table: {
		[shared.consts.positionTypes.offense]: {
			[shared.consts.playTypes.pass]: [
				{max: 30, result: shared.consts.position.QB},
				{max: 60, result: shared.consts.position.WR},
				{max: 70, result: shared.consts.position.RB},
				{max: 80, result: shared.consts.position.OL},
				{max: 100, result: shared.consts.position.FB},
			],
			[shared.consts.playTypes.run]: [
				{max: 10, result: shared.consts.position.QB},
				{max: 15, result: shared.consts.position.WR},
				{max: 65, result: shared.consts.position.RB},
				{max: 85, result: shared.consts.position.OL},
				{max: 100, result: shared.consts.position.FB},
			],
		},
		[shared.consts.positionTypes.defense]: {
			[shared.consts.playTypes.pass]: [
				{max: 10, result: shared.consts.position.DL},
				{max: 30, result: shared.consts.position.LB},
				{max: 65, result: shared.consts.position.CB},
				{max: 100, result: shared.consts.position.S},
			],
			[shared.consts.playTypes.run]: [
				{max: 35, result: shared.consts.position.DL},
				{max: 70, result: shared.consts.position.LB},
				{max: 90, result: shared.consts.position.CB},
				{max: 100, result: shared.consts.position.S},
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
	injury: (positionType, playType) => rollChart(charts.injury.table[positionType][playType]),

	// clone so outside world can't mess with inside world
	charts: clone(charts),

	// allows rolling a chart
	rollChart: rollChart,
};