const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const helmet = require('helmet');
const session = require('express-session');
const authentication = require('./app/system/security/authentication');
const csrf = require('./app/system/security/csrf');
const cors = require('cors');

app.use(helmet());
// secure false for session since it's not https
app.use(session({secret: 'fantasybracketrockslikecasey!', resave: true, saveUninitialized: true, secure: false, httpOnly: false, domain: '*'}));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));


// use cors before all route definitions
app.use(cors({
	origin: (origin, callback) => callback(false, true),
	credentials: true,
	optionsSuccessStatus: 204,
}));

const router = express.Router();

// require authentication on all routes
router.use((req, res, next) => authentication.currentUser(req, () => next()));

// require csrf on posts
app.post('/*', function (req, res, next) {
	csrf.checkCsrf(req);
	next();
});

// load all routes
require('./app/routes')(router);
app.use('/api', router);

const port = process.env.PORT || 8080;
app.listen(port);

console.log('Lisenting on port:' + port);