const tournaments = require('../models/tournaments');
const jsonMessage = require('../system/messages/jsonMessages');

module.exports = function (router) {

	router.route('/tournament/current').get((req, res) => tournaments.select('2018', tournaments => res.json(tournaments[0])));

	router.route('/tournament/save').post((req, res) =>
		tournaments.select(req.body.year, tournamentRecords => {
			// need ID as an object but all the other fields from the request
			const tournament = Object.assign(tournamentRecords[0], req.body, {_id: tournamentRecords[0]._id});
			tournaments.update(tournament, () => res.json(tournament))
		}));
};
