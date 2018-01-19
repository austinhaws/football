const teams = require('../models/teams');
const jsonMessages = require('../system/messages/jsonMessages');
const uuidv1 = require('uuid/v1');


module.exports = {
	saveTeam: (req, res) => {
		// make sure each player has an UUID
		const team = req.body.team;
		team.players.forEach(player => {
			if (!player.uniqueId) {
				player.uniqueId = uuidv1();
			}
		});
		teams.update(req.body.team, () => jsonMessages.success(res));
	},
} ;
