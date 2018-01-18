import React from "react";
import store from "./Store";
import reducers from "./Reducers";
import $ from "jquery";
import jsLogging from 'dts-js-logging';

const shared = {
	funcs: {
		/**
		 * get the csrf object from the state taken in to account that the token may not yet be fetched
		 * @return csrf object or false if not yet gotten
		 */
		getCsrf: () => {
			const csrf = store.getState().csrf;
			return (csrf && csrf.name) ? csrf : false;
		},
		/**
		 * adds csrf to data packet. useful for ajax calls.
		 * @param data your data to which the csrf name/token will be added. can be false/null/blank
		 */
		csrf: data => {
			const csrf = shared.funcs.getCsrf();
			return csrf ? Object.assign({[csrf.name]: csrf.token}, data ? data : {}) : data;
		},

		/**
		 * add csrf token to url
		 *
		 * @param url the url
		 * @return {string} url w/ token
		 */
		csrfUrl: url => {
			const csrf = shared.funcs.getCsrf();
			return csrf ? `${url}${url.includes('?') ? '&' : '?'}${csrf.name}=${csrf.token}` : url;
		},

		startAjax: () => store.dispatch({type: reducers.ACTION_TYPES.SET_AJAXING, payload: true,}),
		stopAjax: () => store.dispatch({type: reducers.ACTION_TYPES.SET_AJAXING, payload: false}),
		ajaxFail: () => false /*console.error(arguments)*/,

		/**
		 * make an ajax call; takes care of ajaxing flag setting and error logging
		 *
		 * @param url - the url to call
		 * @param method - POST / GET
		 * @param data - js object of the data to send
		 * @param callback - function to get the results of the ajax call
		 * @param isRequestBody if true then sends as json string instead of data packet
		 * @param isRefreshCsrf is this the csrf fetch call? all other calls will be queued for later
		 * @param doNotUseCsrf if true then the csrf is not sent in the call; not sure who wants this but go for it
		 */
		ajax: (method, url, data, callback, isRequestBody, isRefreshCsrf, doNotUseCsrf) => {
			shared.funcs.startAjax();

			$.ajax({
				type: method,
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				url: shared.vars.urlBase + (doNotUseCsrf ? url : shared.funcs.csrfUrl(url)),
				data: doNotUseCsrf ? data : (isRequestBody ? JSON.stringify(shared.funcs.csrf(data)) : shared.funcs.csrf(data)),
				cache: false,
				success: callback,
				error: result => {
					console.error('ajax error', result);
					shared.funcs.ajaxFail();
				},
				complete: shared.funcs.stopAjax,
				// set withCredentials to true for cross-domain requests
				xhrFields: {
					withCredentials: true
				},
			});
		},

		// get csrf token for posting
		refreshCsrf: callback => {
			shared.funcs.ajax('GET', 'csrf/current', {},
				csrf => {
					jsLogging({url: 'log/error.json', csrfName: csrf.parameterName, csrfToken: csrf.token,});

					store.dispatch({type: reducers.ACTION_TYPES.SET_CSRF, payload: {name: csrf.csrfName, token: csrf.csrfToken}});
					if (callback) {
						callback();
					}
				}, false, true);
		},

		// who is currently logged in?
		getTeams: () => shared.funcs.ajax('GET', 'team/all', {}, teams => store.dispatch({type: reducers.ACTION_TYPES.SET_TEAMS, payload: teams})),

		// app has started, get some basic information
		startup: () => {
			shared.funcs.getTeams();
		},

		getTeam: teamName => {
			const matches = store.getState().teams.filter(team => team.name === teamName);
			return (matches && matches.length) ? matches[0] : false;
		},

		// order is based on positions const
		positionSortOrder: position => shared.consts.positions.indexOf(position),
		positionType: position => {
			return {
				'QB': shared.consts.positionTypes.offense, 'WR': shared.consts.positionTypes.offense,
				'RB': shared.consts.positionTypes.offense, 'FB': shared.consts.positionTypes.offense, 'OL': shared.consts.positionTypes.offense,

				'DL': shared.consts.positionTypes.defense, 'LB': shared.consts.positionTypes.defense,
				'CB': shared.consts.positionTypes.defense, 'S': shared.consts.positionTypes.defense,

				'P': shared.consts.positionTypes.special, 'K': shared.consts.positionTypes.special,
			}[position];
		},
		positionsByType: () =>
			shared.consts.positions.reduce((groups, position) => {
				groups[shared.funcs.positionType(position)].push(position);
				return groups;
			}, {
				[shared.consts.positionTypes.offense]: [],
				[shared.consts.positionTypes.defense]: [],
				[shared.consts.positionTypes.special]: [],
			})
		,
		/**
		 * calculate totals for showing in the group table
		 *
		 * @param players all the team's players
		 */
		totalPlayingByPositionType: players => {
			const positionsByType = shared.funcs.positionsByType();
			return Object.keys(positionsByType).reduce((groupsTotals, groupType) => {
				// group is a list of positions for this group, find if a position has someone marked as playing
				groupsTotals[groupType].totalPositions = positionsByType[groupType].length;

				// how many of the group's positions have a player of that type playing?
				// - get all players for this group
				const playersForGroupType = positionsByType[groupType].reduce((allPlayers, position) => {
					return allPlayers.concat(players.filter(player => player.position === position));
				}, []);

				// get totals based on those players - assumes only one player is playing in a position (if two WRs marked as playing, this will not prevent that)
				groupsTotals[groupType].totalPlaying = playersForGroupType.filter(player => player.playing).length;
				groupsTotals[groupType].totalRun = playersForGroupType.reduce((total, player) => total + player.run, 0);
				groupsTotals[groupType].totalPass = playersForGroupType.reduce((total, player) => total + player.pass, 0);
				groupsTotals[groupType].totalSpecial = playersForGroupType.reduce((total, player) => total + player.special, 0);

				return groupsTotals;
			}, Object.keys(shared.consts.positionTypes).reduce((groups, type) => {
				groups[shared.consts.positionTypes[type]] = {
					totalPositions: 0,
					totalPlaying: 0,
					totalRun: 0,
					totalPass: 0,
					totalSpecial: 0,
				};
				return groups;
			}, {}));
		},


	},
	vars: {
		// remote webservice - dev
		urlBase: 'http://localhost:8080/football/',
		// local static urls
		// urlBase: 'http://localhost:8080/',
	},
	consts: {
		positions: ['QB', 'WR', 'RB', 'FB', 'OL', 'DL', 'LB', 'CB', 'S', 'P', 'K',],
		positionTypes: {
			offense: 'Offense',
			defense: 'Defense',
			special: 'Special',
		}
	},
};

export default shared;