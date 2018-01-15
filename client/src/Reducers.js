import React from "react";
import clone from "clone";

// !!!!  Be careful that no names match  !!! //
let reducers = {
	ACTION_TYPES: {
		// == Generic == //
		// set ajaxing start/stop
		SET_AJAXING: 'SET_AJAXING',

		// set all the teams
		SET_TEAMS: 'SET_TEAMS',

		// set a picked team on one of the sides
		SET_SELECTED_TEAM: 'SET_SELECTED_TEAM',
	}
};

/*
 !! make sure to always create a copy of state instead of manipulating state directly
 action = {
 type: constant action name (required),
 error: error information (optional),
 payload: data for action (optional),
 meta: what else could you possibly want? (optional)
 }
 */

// set ajaxing state for the spinner to show
// payload: boolean true for an ajax began, false an ajax ended
reducers[reducers.ACTION_TYPES.SET_AJAXING] = (state, action) => {
	const result = clone(state);
	result.ajaxingCount += action.payload ? 1 : -1;
	return result;
};

// set csrf token/name
// payload: {name, token}
reducers[reducers.ACTION_TYPES.SET_TEAMS] = (state, action) => {
	const result = clone(state);
	result.teams = action.payload;
	return result;
};

// set csrf token/name
// payload: {name, token}
reducers[reducers.ACTION_TYPES.SET_SELECTED_TEAM] = (state, action) => {
	const result = clone(state);
	result.selectedTeams[action.payload.side] = action.payload.teamName;
	return result;
};


export default reducers;