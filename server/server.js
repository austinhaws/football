const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const helmet = require('helmet');
const session = require('express-session');
const cors = require('cors');

app.use(helmet());
// secure false for session since it's not https
app.use(session({secret: 'footballrockslikecasey!', resave: true, saveUninitialized: true, secure: false, httpOnly: false, domain: '*'}));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));


// use cors before all route definitions
app.use(cors({
	origin: (origin, callback) => callback(false, true),
	credentials: true,
	optionsSuccessStatus: 204,
}));

const router = express.Router();

// load all routes
require('./app/routes')(router);
app.use('/football', router);

const port = process.env.PORT || 8080;
app.listen(port);

console.log('Lisenting on port:' + port);