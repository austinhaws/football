import React from "react";
import moment from "moment";
import Conference from "./bracket/Conference";
import shared from "./Shared";
import clone from "clone";

// !!!!  Be careful that no names match  !!! //
let reducers = {
	ACTION_TYPES: {
		// == Generic == //
		// set ajaxing start/stop
		SET_AJAXING: 'SET_AJAXING',

		// CSRF Token information: name, token
		SET_CSRF: 'SET_CSRF',

		// set the current logged in user information
		SET_USER: 'SET_USER',

		SET_TOURNAMENT: 'SET_TOURNAMENT',
		SET_MY_PICKS: 'SET_MY_PICKS',

		// tournament edit page
		TOURNAMENT: {
			SET_DATE_FIELD: 'SET_DATE_FIELD',
			SET_ROLL_FIELD: 'SET_ROLL_FIELD',
			SET_EDITING_TOURNAMENT: 'SET_EDITING_TOURNAMENT',
			UPDATE_GAME: 'UPDATE_GAME',
		},

		// bracket edit page
		BRACKET: {
			// clicked on a game and started dragging
			START_DRAG: 'START_DRAG',
			PICK_TEAM_TO_GAME: 'PICK_TEAM_TO_GAME',
		},

		// game edit page
		GAME_EDIT: {
			UPDATE_GAME_FIELD: 'UPDATE_GAME_FIELD',
			// set which game is being edited
			SET_GAME_EDIT: 'SET_GAME_EDIT',
		},

		// when printing, all brackets are fetched, this sets them
		SET_ALL_BRACKETS: 'SET_ALL_BRACKETS',

		// set all the known people
		SET_PEOPLE: 'SET_PEOPLE',
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
reducers[reducers.ACTION_TYPES.SET_CSRF] = (state, action) => {
	const result = clone(state);
	result.csrf = action.payload;
	return result;
};

// set the current user using the app
// payload: the user
reducers[reducers.ACTION_TYPES.SET_USER] = (state, action) => {
	const result = clone(state);
	result.user = action.payload;
	return result;
};

// set the current tournament being used; also update some cached things like upcoming dates and next date
// payload: the tournament
reducers[reducers.ACTION_TYPES.SET_TOURNAMENT] = (state, action) => {
	let result = clone(state);
	result.tournament = action.payload;

	// load extra info like next upcoming date
	result.home.nextDateIndex = 0;
	const today = moment();
	shared.vars.upcomingDates = result.tournament.dates.map(d => {
		const momentDate = moment(d.date);
		return {
			name: d.name,
			momentDate: momentDate,
			afterToday: today.isBefore(momentDate),
		};
	});
	result.home.nextDateIndex = shared.vars.upcomingDates.reduce((result, d, i) => (result === false && d.afterToday) ? i : result, false);

	// also update the current editing tournament
	return reducers[reducers.ACTION_TYPES.TOURNAMENT.SET_EDITING_TOURNAMENT](result, action);
};

reducers[reducers.ACTION_TYPES.SET_MY_PICKS] = (state, action) => {
	const result = clone(state);
	result.myPicks = action.payload;
	return result;
};

// set a date field on the tournament when editing a tournament
// payload: {index, value}
reducers[reducers.ACTION_TYPES.TOURNAMENT.SET_DATE_FIELD] = (state, action) => {
	const result = clone(state);
	// assumes editing tournament is already loaded
	result.tournamentEdit = Object.assign({}, result.tournamentEdit);
	result.tournamentEdit.tournament = Object.assign({}, result.tournamentEdit.tournament);
	result.tournamentEdit.tournament.dates = result.tournamentEdit.tournament.dates.map(d => Object.assign({}, d));
	result.tournamentEdit.tournament.dates[action.payload.index].date = action.payload.value;
	return result;
};

// set a roll field on the tournament when editing a tournament
// payload: {index, value}
reducers[reducers.ACTION_TYPES.TOURNAMENT.SET_ROLL_FIELD] = (state, action) => {
	const result = clone(state);
	// assumes editing tournament is already loaded
	result.tournamentEdit = JSON.parse(JSON.stringify(result.tournamentEdit));
	result.tournamentEdit.tournament.rolls[action.payload.index] = action.payload.value;
	return result;
};

// start editing the tournament by making a copy of it to edit
// payload: the tournament to edit
reducers[reducers.ACTION_TYPES.TOURNAMENT.SET_EDITING_TOURNAMENT] = (state, action) => {
	const result = clone(state);
	result.tournamentEdit.tournament = Object.assign({}, action.payload);
	result.tournamentEdit.tournament.dates = result.tournamentEdit.tournament.dates.map(d => {
		d.date = d.date.split('T')[0];
		return d;
	});
	return result;
};

// start dragging a bracket choice (incomplete)
// payload: the game being dragged
reducers[reducers.ACTION_TYPES.BRACKET.START_DRAG] = (state, action) => {
	const result = clone(state);
	// quick and dirty full object deep copy
	result.bracket = JSON.parse(JSON.stringify(result.bracket));
	result.bracket.draggedGame = action.payload;
	result.bracket.droppableGames = [];
	let gameNumber = action.payload.gameNumber;
	for (let x = action.payload.round + 1; x < 8; x++) {
		const conference = x >= 6 ? Conference.CONFERENCES.FINALS : action.payload.conference;
		if (x === 6 && (
				action.payload.conference === Conference.CONFERENCES.TOP_RIGHT ||
				action.payload.conference === Conference.CONFERENCES.BOTTOM_RIGHT
			)) {
			gameNumber = 1;
		} else {
			gameNumber = Math.floor(gameNumber /= 2);
		}
		result.bracket.droppableGames.push({
			conference: conference,
			round: x,
			gameNumber: gameNumber,
		})
	}
	return result;
};

// update a field when editing a game
// payload: {field, value}
reducers[reducers.ACTION_TYPES.GAME_EDIT.UPDATE_GAME_FIELD] = (state, action) => {
	const result = clone(state);
	result.gameEdit.game[action.payload.field] = action.payload.value;
	return result;
};

// set the game to edit as a copy from the main tournament object
// payload: {conference, round, gameNumber}
reducers[reducers.ACTION_TYPES.GAME_EDIT.SET_GAME_EDIT] = (state, action) => {
	const result = clone(state);
	result.gameEdit.conference = action.payload.conference;
	result.gameEdit.round = action.payload.round;
	result.gameEdit.gameNumber = action.payload.gameNumber;
	result.gameEdit.game = Object.assign({}, result.tournament.conferences[action.payload.conference].rounds[action.payload.round][action.payload.gameNumber]);
	return result;
};

// update the main tournament's information about a single game (after the game has been saved when editing)
// payload: {conference, round, gameNumber, game}
reducers[reducers.ACTION_TYPES.TOURNAMENT.UPDATE_GAME] = (state, action) => {
	const result = clone(state);
	result.tournament.conferences[action.payload.conference].rounds[action.payload.round][action.payload.gameNumber] = action.payload.game;
	return result;
};

// update the main tournament's information about a single game (after the game has been saved when editing)
// payload: {conference, round, gameNumber, game}
reducers[reducers.ACTION_TYPES.SET_ALL_BRACKETS] = (state, action) => {
	const result = clone(state);
	result.allBrackets = action.payload;
	return result;
};

// update the main tournament's information about a single game (after the game has been saved when editing)
// payload: {conference, round, gameNumber, game}
reducers[reducers.ACTION_TYPES.SET_PEOPLE] = (state, action) => {
	const result = clone(state);
	result.people = action.payload;
	return result;
};

export default reducers;