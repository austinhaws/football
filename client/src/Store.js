import React from "react";
import {createStore} from "redux";
import reducers from "./Reducers";
import storeChanged from "./StoreChanged";

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
		// count of outstanding ajax requests
		ajaxingCount: 0,

		// all the teams
		teams: [],

		// which teams are selected on either side
		selectedTeams: {
			left: '',
			right: '',
		},
	}

	// for chrome redux plugin
	, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

store.subscribe(storeChanged);
export default store;