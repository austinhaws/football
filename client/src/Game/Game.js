import React from "react";
import Chance from "chance";
import shared from "../Shared";
import charts from "../Game/RollChart";

const chance = new Chance();

const rollTypes = {
	// 1-100%
	percentile: () => chance.integer({min: 1, max: shared.consts.rolls.percentile}),
	// 1:X chance someone got hurt
	injuryRoll: () => chance.integer({min: 1, max: shared.consts.rolls.injury}),
	// 1:X chance that a penalty occurred
	penaltyRoll: () => chance.integer({min: 1, max: shared.consts.rolls.penalty}),
	// bonus to add to the total roll result
	bonusRoll: () => chance.integer({min: 1, max: shared.consts.rolls.bonus}),
	// roll a single d6 (3 total per team for a down)
	singleDownRoll: () => chance.integer({min: 1, max: shared.consts.rolls.singleDown}),

	// what happened this down for this team?
	downRoll: getsBonus => {
		const rolls = [
			rollTypes.singleDownRoll(),
			rollTypes.singleDownRoll(),
			rollTypes.singleDownRoll(),
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
		result.total = result.rolls.reduce((total, roll) => total + roll, 0) + (result.bonus ? result.bonus : 0);
		return result;
	},
	// is it all the same?
	rollIsTriples: rolls => rolls[0] === rolls[1] && rolls[1] === rolls[2],
	// are at least two the same? matters for offense, not for defense
	rollIsDoubles: rolls => rolls[0] === rolls[1] || rolls[0] === rolls[2] || rolls[1] === rolls[2],
};

export default {
	rollTeamDown: (offBonus, offTeam, defBonus, defTeam, offenseGetsBonus, playType) => {
		function showRolls(team, totals, rolls, bonus) {
			return {cssClass: 'roll', text: `${team.name}: ${totals}  = ${rolls.rolls.join(' + ')}${rolls.bonus ? ' + ' + rolls.bonus : ''} + ${bonus}`};

		}
		// roll basic rolls
		const offenseRolls = rollTypes.downRoll(offenseGetsBonus);
		const defenseRolls = rollTypes.downRoll(!offenseGetsBonus);

		const output = [];
		// check for penalties
		if (offenseRolls.penalty && defenseRolls.penalty) {
			output.push({cssClass: 'penalty', text: 'Offsetting penalties'});
		} else if (offenseRolls.penalty) {
			output.push({cssClass: 'penalty', text: 'Offensive penalty'});
		} else if (defenseRolls.penalty) {
			output.push({cssClass: 'penalty', text: 'Defensive penalty'});
		}

		const totals = {[shared.consts.positionTypes.offense]: offenseRolls.total + offBonus, [shared.consts.positionTypes.defense]: defenseRolls.total + defBonus};

		// check who won the roll
		if (defenseRolls.triples) {
			output.push({cssClass: 'big', text: 'Turnover!'});
			output.push({cssClass: 'result', text: `${defTeam.name} advances ${defenseRolls.rolls[0]}0 yards`});
		} else {
			if (totals[shared.consts.positionTypes.offense] >= totals[shared.consts.positionTypes.defense]) {
				if (offenseRolls.triples) {
					output.push({cssClass: 'big', text: 'Long Bomb!'});
					output.push({cssClass: 'result', text: `${offTeam.name} advances ${offenseRolls.rolls[0]} yards`});
				} else if (offenseRolls.doubles) {
					output.push({cssClass: 'big', text: 'Big play'});
					output.push({cssClass: 'result', text: `${offTeam.name} advances 20 yards`});
				} else {
					output.push({cssClass: 'big', text: `${offTeam.name} advances 10 yards`});
				}
			} else {
				output.push({cssClass: 'big', text: '4th down'});
				output.push({cssClass: 'result', text: `${offTeam.name} stopped.`});
			}
		}

		output.push(showRolls(offTeam, totals[shared.consts.positionTypes.offense], offenseRolls, offBonus));
		output.push(showRolls(defTeam, totals[shared.consts.positionTypes.defense], defenseRolls, defBonus));

		// check injuries
		if (offenseRolls.injury) {
			const player = charts.injury(shared.consts.positionTypes.offense, playType);
			output.push({cssClass: 'injury', text: `${offTeam.name} Injury! (${player})`});
		}
		if (defenseRolls.injury) {
			const player = charts.injury(shared.consts.positionTypes.defense, playType);
			output.push({cssClass: 'injury', text: `${defTeam.name} Injury! (${player})`});
		}

		return {output, offenseRolls, defenseRolls}
	},
}