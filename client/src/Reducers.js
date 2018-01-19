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

		// a player editable field has been changed
		PLAYER_FIELD_CHANGED: 'PLAYER_FIELD_CHANGED',

		// set the id of the player to edit
		SET_EDITING_PLAYER_ID: 'SET_EDITING_PLAYER_ID',
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
	let result = clone(state);
	result.teams = action.payload;

	// if editing a player, then load that player now that data is available
	if (result.editingPlayerId) {
		result = reducers[reducers.ACTION_TYPES.SET_EDITING_PLAYER_ID](result, {payload: result.editingPlayerId});
	}
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
			if (player.uniqueId === action.payload.player.uniqueId) {
				player.playing = !player.playing;
			} else {
				// only one of a type playing at a time; if unchecking, then there shouldn't have been any checked anyways
				player.playing = false;
			}
		}
	});

	//
	return result;
};

// set a field in a player
// payload: {uniqueId, field, value}
reducers[reducers.ACTION_TYPES.PLAYER_FIELD_CHANGED] = (state, action) => {
	const result = clone(state);
	result.editingPlayer[action.payload.field] = action.payload.value;
	return result;
};


// set the currently being edited player information
reducers[reducers.ACTION_TYPES.SET_EDITING_PLAYER_ID] = (state, action) => {
	const result = clone(state);

	result.editingPlayerId = action.payload;
	if (result.teams && result.teams.length) {
		result.editingPlayer = clone(getPlayerById(result.teams, action.payload));
	} else {
		result.editingPlayer = undefined;
	}
	return result;
};

/**
 * find a player given its unique id
 * @param teams the teams of the state to search (parameter since state may have just been cloned)
 * @param playerId the player's id to match
 */
function getPlayerById(teams, playerId) {
	return teams
		.reduce((players, team) => players.concat(team.players), [])
		// find just the player being changed
		.find(player => playerId === player.uniqueId);

}

export default reducers;