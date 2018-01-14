const picks = require('../models/picks');
const authentication = require('../system/security/authentication');
const pickService = require('../service/picks');
const people = require('../models/people');

module.exports = function (router) {

	router.route('/person/current').get((req, res) => authentication.currentUser(req, user => res.json(user)));

	router.route('/person/picks').get((req, res) => authentication.currentUser(req, user => pickService.getUserPicks(user, res)));

	router.route('/person/pick').post((req, res) => authentication.currentUser(req, user => picks.select(user.uid, userPicks => {
		if (!userPicks.length) {
			res.json({fail: 'no picks found, refresh and try again'});
		} else {
			const userPick = userPicks[0];
			const {fromGame, toGame} = req.body;
			pickService.makePick(userPick, fromGame, toGame);
			picks.update(userPick, () => res.json(userPick));
		}
	})));

	router.route('/person/all').get((req, res) => people.selectAll(people => res.json(people)));
};
