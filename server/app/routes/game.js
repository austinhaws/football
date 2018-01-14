const tournaments = require('../models/tournaments');

module.exports = function (router) {

	router.route('/game/save').post((req, res) => {
		// get tournament
		tournaments.select('2018', tournamentRecords => {
			// go to that game in the tournament using confernece, round, gamenumber and replace game record
			tournamentRecords[0].conferences[req.body.conference].rounds[req.body.round][req.body.gameNumber] = req.body.game;

			// save the tournament and return the saved tournament
			tournaments.update(tournamentRecords[0], () => res.json(tournamentRecords[0]));
		});
	});
};
