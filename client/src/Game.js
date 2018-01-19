import React from "react";
import chance from "chance";

class Roll {
	constructor(sides, result) {
		this.sides = sides;
		this.result = result;
	}
}

const rollTypes = {
	// 1-100%
	percentile: (sides = 100) => chance.integer({min: 1, max: sides}),
	// 1:X chance someone got hurt
	injuryRoll: (sides = 20) => chance.integer({min: 1, max: sides}),
	// 1:X chance that a penalty occurred
	penaltyRoll: (sides = 10) => chance.integer({min: 1, max: sides}),
	// bonus to add to the total roll result
	bonusRoll: (sides = 4) => new Roll(sides, chance.integer({min: 1, max: sides})),
	// roll a single d6 (3 total per team for a down)
	singleDownRoll: (sides = 6) => new Roll(sides, chance.integer({min: 1, max: sides})),

	// what happened this down for this team?
	downRoll: getsBonus => {
		const rolls = [
			new Roll(6, rollTypes.singleDownRoll()),
			new Roll(6, rollTypes.singleDownRoll()),
			new Roll(6, rollTypes.singleDownRoll()),
		];
		const result = {
			// the standard 3d6
			rolls: rolls,
			// were doubles rolled? offense cares
			doubles: rollTypes.rollIsDoubles(rolls),
			// were triples rolled?
			triples: rollTypes.rollIsTriples(rolls),
			// did a penalty occur?
			penalty: rollTypes.penaltyRoll() === 1,
			// did an injury occur?
			injury: rollTypes.injuryRoll() === 1,
			// did this team get a bonus to their roll and if so how much
			bonus: getsBonus ? rollTypes.bonusRoll() : undefined,
		};
		result.total = result.rolls.map(roll => roll.result).reduce((total, roll) => total + roll, 0) + (result.bonus ? result.bonus.result : 0);
		return result;
	},
	// is it all the same?
	rollIsTriples: rolls => rolls[0] === rolls[1] && rolls[1] === rolls[2],
	// are at least two the same? matters for offense, not for defense
	rollIsDoubles: rolls => rolls[0] === rolls[1] || rolls[0] === rolls[2] || rolls[1] === rolls[2],
};

export default {
	rollTeamDown: (offBonus, offTeam, defBonus, defTeam, offenseGetsBonus) => {
		// roll basic rolls
		const offenseRolls = rollTypes.downRoll(offenseGetsBonus);
		const defenseRolls = rollTypes.downRoll(!offenseGetsBonus);

		const output = [];
		// check for penalties
		if (offenseRolls.penalty && defenseRolls.penalty) {
			output.push('Offsetting penalties');
		} else if (offenseRolls.penalty) {
			output.push('Offensive penalty');
		} else if (defenseRolls.penalty) {
			output.push('Defensive penalty');
		}

		output.push(`${offTeam.name}: ${offenseRolls.total}         ${defTeam.name}: ${defenseRolls.total}`);

		// check who won the roll
		if (defenseRolls.triples) {
			output.push(`Turnover! ${defTeam.name} advances ${defenseRolls.rolls[0].value} yards`);
		} else {
			if (offenseRolls.total >= defenseRolls.total) {
				if (offenseRolls.triples) {
					output.push(`Long Bomb! ${offTeam.name} advances ${offenseRolls.rolls[0].value} yards`);
				} else if (offenseRolls.doubles) {
					output.push(`Big play. ${offTeam.name} advances 20 yards`);
				} else {
					output.push(`${offTeam.name} Advances`);
				}
			} else {
				output.push(`4th down. ${offTeam.name} stopped.`);
			}
		}

		//show rolls
		[offenseRolls, defenseRolls]
			.map(rolls => rolls.rolls
				.reduce(roll => `d${roll.sides} (${roll.value})`))
			.forEach(rollResult => output.push(rollResult));

		return {output, offenseRolls, defenseRolls}
	},
}