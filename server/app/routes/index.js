const fs = require('fs');

// https://stackoverflow.com/questions/6059246/how-to-include-route-handlers-in-multiple-files-in-express
// require all files in this folder
module.exports = app => fs.readdirSync(__dirname)

	// don't include index.js
	.filter(f => !['index.js', 'jsonMessages.js'].includes(f))

	// take .js off the name
	.map(f => f.substr(0, f.indexOf('.')))

	// require the file
	.forEach(f => require('./' + f)(app));
