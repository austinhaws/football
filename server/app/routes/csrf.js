const csrf = require('../system/security/csrf');

module.exports = function (router) {

	router.route('/csrf/current').get((req, res) => csrf.getCsrf(req, csrf => res.json(csrf)));
};
