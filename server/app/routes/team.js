const teams = require('../models/teams');
const jsonMessages = require('../system/messages/jsonMessages');

module.exports = function (router) {

	router.route('/team/all').get((req, res) => teams.selectAll(allTeams => res.json(allTeams)));
	router.route('/team/save').post((req, res) => teams.update(req.body.team, () => jsonMessages.success(res)));
};
