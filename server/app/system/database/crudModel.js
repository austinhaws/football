const mongo = require('./connection.js');
const ObjectID = require('mongodb').ObjectID;


/** generic crud for any table
 usage: crudModule('pick', 'employeeFk');  where 'pick' is the tablename and 'employeeFk' is lookup id field (not necessarily the auto generated pk field)
 returns an object and can add whatever custom queries you want to that object before exporting it from the model js file

 some tables like person use a look up key like uid but their actual pk is elsewhere like person_pk. the insertIdField is for setting that auto generated pk when it's not the same as idField

 ie.
 const crudModule = require('../system/database/crudModel');
 const pickQueries = crudModule('pick', 'employeeFk');
 pickQueries.report = (param1, param2, callback) => connection.query('DO SOME SQL FANCY ? STUFF ? HERE ?', [param1, param2, param2], callback);
 module.exports = pickQueries;
 */

/**
 * create callback function for mongo results to callback to passed in callback the results
 *
 * @param callback where to send results
 * @return {function(*=, *=)} takes err and res and sends res back to callback if there was no err
 */
function mongoErrorHandler(callback) {
	return (err, res) => {
		if (err) {
			throw err;
		}
		if (callback) {
			callback(res);
		}
	}
}

function fixId(data) {
	if (data._id && (typeof(data._id) === 'string')) {
		data._id = ObjectID.createFromHexString(data._id)
	}
	return data;
}

/**
 * create an id object for the data
 *
 * @param idField name of the field that is the id for the data, or falsey for _id
 * @param data the data object containing the data (including the id field)   -- OR --  the actual id value
 * @return {{}} new object with id in it
 */
function createIdObject(idField, data) {
	const field = idField ? idField : '_id';
	return {[field]: (data instanceof Object) ? data[field] : data};
}

module.exports = (collection, idField) => {

	const model = {
		insert: (record, callback) => mongo.db.collection(collection).insertOne(record, mongoErrorHandler(callback)),

		select: (idFieldValue, callback) => mongo.db.collection(collection).find(createIdObject(idField, idFieldValue)).toArray(mongoErrorHandler(callback)),

		update: (data, callback) => mongo.db.collection(collection).updateOne(createIdObject(idField, data), fixId(data), mongoErrorHandler(callback)),

		delete: (data, callback) => mongo.db.collection(collection).deleteOne(createIdObject(idField, data), data, mongoErrorHandler(callback)),

		selectAll: callback => mongo.db.collection(collection).find().toArray(mongoErrorHandler(callback)),
	};

	// search for the user, update if exists, insert if not; had tried checking update count, but then auto created _id field is not included
	model.replace = (data, callback) =>
		model.select(data, user => {
			if (user && user.length) {
				// copy in to existing db object so that fields not passed in to data are not changed (ie people.isAdmin)
				const updateData = Object.assign(user[0], data);
				// put id in to record (whole reason for doing "select" at the front in the first place instead of update/count
				model.update(updateData, res => callback(updateData));
			} else {
				// insert auto puts id in to data passed in to it so just return that object
				model.insert(data, () => callback(data));
			}
		});

	return model;
};
