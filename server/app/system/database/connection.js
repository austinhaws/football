const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/football";

const mongo = {db: false};

MongoClient.connect(url, function(err, db) {
	if (err) throw err;
	console.log("Database connected!");
	mongo.db = db;
});

module.exports = mongo;