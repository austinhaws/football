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

		getPlayerByUniqueId: playerUniqueId => store.getState().teams
			// get teams' players list
			.reduce((players, team) => players.concat(team.players), [])
			// find the desired player
			.find(player => player.uniqueId === playerUniqueId),


		getTeam: teamName => {
			const matches = store.getState().teams.filter(team => team.name === teamName);
			return (matches && matches.length) ? matches[0] : undefined;
		},

		// save a whole team
		saveTeam: team => shared.funcs.ajaxPost('team/save', {team: team}),

		// order is based on positions const
		positionSortOrder: position => shared.consts.positions.indexOf(position),
		positionType: position => {
			return {
				[shared.consts.position.QB]: shared.consts.positionTypes.offense, [shared.consts.position.WR]: shared.consts.positionTypes.offense,
				[shared.consts.position.RB]: shared.consts.positionTypes.offense, [shared.consts.position.FB]: shared.consts.positionTypes.offense, [shared.consts.position.OL]: shared.consts.positionTypes.offense,

				'DL': shared.consts.positionTypes.defense, [shared.consts.position.LB]: shared.consts.positionTypes.defense,
				[shared.consts.position.CB]: shared.consts.positionTypes.defense, [shared.consts.position.S]: shared.consts.positionTypes.defense,

				[shared.consts.position.P]: shared.consts.positionTypes.special, [shared.consts.position.K]: shared.consts.positionTypes.special,
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
				groupsTotals[groupType].totalKick = playersForGroupTypePlaying.reduce((total, player) => total + (player.position === shared.consts.position.K ? player.special : 0), 0);
				groupsTotals[groupType].totalPunt = playersForGroupTypePlaying.reduce((total, player) => total + (player.position === shared.consts.position.P ? player.special : 0), 0);

				return groupsTotals;
			}, Object.keys(shared.consts.positionTypes).reduce((groups, type) => {
				groups[shared.consts.positionTypes[type]] = {
					totalPositions: 0,
					totalPlaying: 0,
					totalRun: 0,
					totalPass: 0,
					totalSpecial: 0,
					totalPunt: 0,
					totalKick: 0,
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
		// this should probably be a map instead of an array... that way it can be an enum
		position: {
			QB: 'QB',
			WR: 'WR',
			RB: 'RB',
			FB: 'FB',
			OL: 'OL',
			DL: 'DL',
			LB: 'LB',
			CB: 'CB',
			S: 'S',
			P: 'P',
			K: 'K',
		},
		positionTypes: {
			offense: 'Offense',
			defense: 'Defense',
			special: 'Special',
		},
		playTypes: {
			run: 'run',
			pass: 'pass',
			special: 'special',
		},
		rolls: {
			// sides of dice for these types of rolls
			percentile: 100,
			injury: 40,
			penalty: 30,
			bonus: 4,
			singleDown: 6,
		}
	},
};

shared.consts.positions = [
	shared.consts.position.QB,
	shared.consts.position.WR,
	shared.consts.position.RB,
	shared.consts.position.FB,
	shared.consts.position.OL,
	shared.consts.position.DL,
	shared.consts.position.LB,
	shared.consts.position.CB,
	shared.consts.position.S,
	shared.consts.position.P,
	shared.consts.position.K,
];

export default shared;