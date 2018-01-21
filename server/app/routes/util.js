const uuidv1 = require('uuid/v1');

module.exports = function (router) {
	router.route('/util/uuid').get((req, res) => res.json({uuid: uuidv1()}));
};
