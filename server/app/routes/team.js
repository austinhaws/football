const teams = require('../models/teams');

module.exports = function (router) {

	router.route('/team/all').get((req, res) => teams.selectAll(allTeams => res.json(allTeams)));
};
