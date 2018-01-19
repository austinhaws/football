import React from "react";
import store from "./Store";
import reducers from "./Reducers";
import axios from "axios";

const shared = {

	funcs: {
		axiosGeneric: (method, url, data, callback) => {
			function stopAjax() {
				store.dispatch({type: reducers.ACTION_TYPES.SET_AJAXING, payload: false,});
			}
			store.dispatch({type: reducers.ACTION_TYPES.SET_AJAXING, payload: true,});
			axios[method](shared.vars.urlBase + url, data)
				.then(response => {
					stopAjax();
					if (callback) {
						callback(response.data);
					}
				})
				.catch(error => {
					stopAjax();
					console.error(error);
				})
				.finally(() => {
					store.dispatch({type: reducers.ACTION_TYPES.SET_AJAXING, payload: false});
				});
		},

		ajaxGet: (url, callback) => {
			shared.funcs.axiosGeneric('get', url, undefined, callback);
		},
		ajaxPost: (url, data, callback) => {
			shared.funcs.axiosGeneric('post', url, data, callback);
		},

		// who is currently logged in?
		getTeams: () => shared.funcs.ajaxGet('team/all', teams => store.dispatch({type: reducers.ACTION_TYPES.SET_TEAMS, payload: teams})),

		// app has started, get some basic information
		startup: () => {
			shared.funcs.getTeams();
		},

		getTeam: teamName => {
			const matches = store.getState().teams.filter(team => team.name === teamName);
			return (matches && matches.length) ? matches[0] : undefined;
		},

		saveTeam: team => shared.funcs.ajaxPost('team/save', {team: team}),

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

				const playersForGroupTypePlaying = playersForGroupType.filter(player => player.playing);

				// get totals based on those players - assumes only one player is playing in a position (if two WRs marked as playing, this will not prevent that)
				groupsTotals[groupType].totalPlaying = playersForGroupTypePlaying.length;
				groupsTotals[groupType].totalRun = playersForGroupTypePlaying.reduce((total, player) => total + player.run, 0);
				groupsTotals[groupType].totalPass = playersForGroupTypePlaying.reduce((total, player) => total + player.pass, 0);
				groupsTotals[groupType].totalSpecial = playersForGroupTypePlaying.reduce((total, player) => total + player.special, 0);

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