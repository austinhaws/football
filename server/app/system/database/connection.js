const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017";

const mongo = {db: false};

MongoClient.connect(url, function(err, client) {
	if (err) throw err;
	console.log("Database connected!");
	mongo.db = client.db('football');
});

module.exports = mongo;