import React from "react";
import shared from "./Shared";
import store from "./Store";
import clone from "clone";

// Redux stores state. You should react to data change instead of specific actions. Subscribe
// may not be triggered for every action, but after all the actions are handled, it does call
// subscribe. So, check for the data changes you care about and handle them here.

/**
 * check if any team changed, and if so, ajax send it to the server
 * @param previousState what the state looked like the last time
 * @param state
 */
function checkTeamChange(previousState, state) {
	state.teams.forEach(newTeam => {
		const newTeamJson = JSON.stringify(newTeam);
		const oldTeam = previousState.teams.find(oldTeam => oldTeam.name === newTeam.name);
		if (oldTeam && newTeamJson !== JSON.stringify(oldTeam)) {
			shared.funcs.saveTeam(newTeam);
		}
	});
}

// how the state looked last time subscribe fired
let previousState = undefined;

// respond to subscribe events, data may have changed
export default () => {
	const state = store.getState();
	// update previous state so that when ajaxing updates the store it doesn't cause the change to be detected again
	const usePreviousStatue = clone(previousState);
	previousState = state;
	// fire all the changers
	if (usePreviousStatue) {
		[
			checkTeamChange,
		].forEach(func => func(usePreviousStatue, state));
	}
};
