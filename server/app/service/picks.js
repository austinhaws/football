const picksModel = require('../models/picks');
const tournaments = require('../models/tournaments');
const clone = require('clone');
const conferences = require('../enums/conferences');

/**
 * loop through rounds for a teamIds possible games and callback to set what to do at that game
 *
 * @param toGame loop until get to this game
 * @param conferenceStart at which conference to start looping
 * @param roundStart at which round to start looping
 * @param gameNumberStart at which game number to start looping
 * @param setCallback at each game, call this funciton
 */
function applyPick(toGame, conferenceStart, roundStart, gameNumberStart, setCallback) {
	while (conferenceStart !== toGame.conference || roundStart !== toGame.round) {
		// advance to next round
		roundStart++;
		if (roundStart >= 6) {
			// finals, so change conference and round

			// conferences go to specific games in first round of finals
			switch (conferenceStart) {
				case conferences.TOP_LEFT:
				case conferences.BOTTOM_LEFT:
					gameNumberStart = 0;
					break;
				case conferences.TOP_RIGHT:
				case conferences.BOTTOM_RIGHT:
					gameNumberStart = 1;
					break;
			}
			conferenceStart = 'finals';
			roundStart = 1;
		} else {
			gameNumberStart = Math.floor(gameNumberStart / 2);
		}

		// assign winner to the dragged team
		setCallback(conferenceStart, roundStart, gameNumberStart);
	}
}

module.exports = {

	/**
	 * user has made a pick
	 * @param userPicks the user's full picks mongo object
	 * @param fromGame which game the user started dragging
	 * @param toGame at which game the drag ended
	 */
	makePick: (userPicks, fromGame, toGame) => {
		// get winning team from start drag game
		const fromGameObj = userPicks[fromGame.conference].rounds[fromGame.round][fromGame.gameNumber];
		const teamId = fromGameObj.teamId ? parseInt(fromGameObj.teamId, 10) : fromGameObj.winningTeamId;

		// find dragged team's starting position
		let conference = false;
		let gameNumber = false;
		let round = 1;
		// find source conference and position
		Object.values(conferences)
			.forEach(k => {
				const round1 = userPicks[k].rounds[1];
				round1.forEach((team, i) => {
					if (parseInt(team.teamId, 10) === teamId) {
						gameNumber = i;
						conference = k;
					}
				});
			});

		// pick the team all the way through the target game
		let deadTeamId = false;
		applyPick(toGame, conference, round, gameNumber, (conference, round, gameNumber) => {
			deadTeamId = userPicks[conference].rounds[round][gameNumber].winningTeamId;
			userPicks[conference].rounds[round][gameNumber].winningTeamId = teamId;
		});

		// unset the originally picked team from the target game on through the finals since they are no longer valid
		applyPick({
			conference: 'finals',
			round: 2,
			gameNumber: 0,
		}, toGame.conference, toGame.round, toGame.gameNumber, (conference, round, gameNumber) => {
			if (userPicks[conference].rounds[round][gameNumber].winningTeamId === deadTeamId) {
				userPicks[conference].rounds[round][gameNumber].winningTeamId = false;
			}
		});
	},

	getUserPicks(user, res) {
		function setPicksResponse(res, picks) {
			res.json(picks);
		}

		picksModel.select(user.uid, picks => {
			if (picks.length) {
				setPicksResponse(res, picks[0]);
			} else {
				// load the tournament
				tournaments.select('2018', tournamentRecords => {
					const tournament = tournamentRecords[0];

					// copy the tournament to get the base layout of the whole bracket and the starting teams
					const userPicks = clone(tournament.conferences);
					userPicks.uid = user.uid;

					// set each game of the bracket to be default pick data
					Object.values(conferences).forEach(conference => {
						// loop through each round of the conference
						[...Array(conference === conferences.FINALS ? 3 : 6).keys()].forEach(round => {
							// first round of non-conference finals doesn't change
							if (round > 1 || (round >= 1 && conference === conferences.FINALS)) {
								// clear all pick items
								userPicks[conference].rounds[round] = userPicks[conference].rounds[round].map(() => { return {
									topTeamId: false,
									bottomTeamId: false,
									winningTeamId: false,
								};})
							}
						})
					});

					// save and return the result
					picksModel.insert(userPicks, () => setPicksResponse(res, userPicks));
				})
			}
		});
	},

	getAllPicks: res => {
		picksModel.selectAll(picks => res.json(picks));
	}
};
