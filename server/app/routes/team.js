const teams = require('../models/teams');
const teamService = require('../service/teamService');

module.exports = function (router) {

	router.route('/team/all').get((req, res) => teams.selectAll(allTeams => res.json(allTeams)));
	router.route('/team/save').post((req, res) => teamService.saveTeam(req, res));
};
