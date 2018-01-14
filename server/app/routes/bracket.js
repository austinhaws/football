const pickService = require('../service/picks');

module.exports = function (router) {
	router.route('/bracket/all').get((req, res) => pickService.getAllPicks(res));
};
