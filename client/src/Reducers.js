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

		// toggle a player's playing status
		TOGGLE_PLAYER_PLAYING: 'TOGGLE_PLAYER_PLAYING',
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

// set which team is selected for a side of a game
// payload: {name, token}
reducers[reducers.ACTION_TYPES.SET_SELECTED_TEAM] = (state, action) => {
	const result = clone(state);
	result.selectedTeams[action.payload.side] = action.payload.teamName;
	return result;
};

// toggle a player's "playing" status
// payload: {name, token}
reducers[reducers.ACTION_TYPES.TOGGLE_PLAYER_PLAYING] = (state, action) => {
	const result = clone(state);

	// get the team
	const team = result.teams.filter(team => team.name === action.payload.team.name)[0];

	// get the player
	team.players.forEach(player => {
		if (player.position === action.payload.player.position) {
			if (
				player.run === action.payload.player.run &&
				player.pass === action.payload.player.pass &&
				player.special === action.payload.player.special
			) {
				// matches on run/pass/special since there isn't any other identifier (maybe later add names)
				player.playing = !player.playing;
			} else {
				// only one of a type playing at a time, if unchecking, then there shouldn't have been any checked anyways
				player.playing = false;
			}
		}
	});

	//
	return result;
};


export default reducers;