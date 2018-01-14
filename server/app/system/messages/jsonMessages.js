const fs = require('fs');

// https://stackoverflow.com/questions/6059246/how-to-include-route-handlers-in-multiple-files-in-express
// require all files in this folder
module.exports = {
	success: res => res.json({success: 'success'}),
	error: (res, error) => res.json({error: error}),
};