import React from "react";
import {createStore} from "redux";
import reducers from "./Reducers";

// the store to connect all components to their data
const store = createStore((state, action) => {
		// === reducers ===
		let reducer = false;

		// is reducer valid?
		if (action.type in reducers) {
			reducer = reducers[action.type];
		}

		// ignore redux/react "system" reducers
		if (!reducer && action.type.indexOf('@@') !== 0) {
			console.error('unknown reducer action:', action.type, action)
		}

		return reducer ? reducer(state, action) : state;
	}, {
		// home page
		home: {
			// which of the tournament's dates is the next upcoming event
			nextDateIndex: undefined,
		},

		// count of outstanding ajax requests
		ajaxingCount: 0,

		// the csrf token/name
		csrf: {
			name: '',
			token: '',
		},

		tournamentEdit: {
			tournament: undefined,
		},

		// current logged in user
		user: undefined,

		// the current tournament
		tournament: undefined,

		// current people in the app
		people: undefined,

		// the current logged in person's picks
		myPicks: undefined,

		bracket: {
			// which game is currently selected
			draggedGame: undefined,
			// possible places to drop the currently dragged game
			droppableGames: undefined,
		},
		gameEdit: {
			// the game being edited
			game: undefined,

			// the location of this game
			conference: undefined,
			round: undefined,
			gameNumber: undefined,
		},

		// all brackets for the tournament (for printing)
		allBrackets: undefined,
	}

	// for chrome redux plugin
	, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
export default store;