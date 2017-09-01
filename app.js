const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser')
const http = require('http');
const dotenv = require('dotenv').config();
const validator = require('express-validator');

const app = express();

const home = require('./routes/home');
const auth = require('./routes/auth');
const dash = require('./routes/dash');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'X'}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(validator());

if (process.env.ENVIRONMENT === 'debug')
    app.get('*', (req, res, next) => {
        console.log(`Requesting URL '${req.url}'`);
        next();
    });

app.use('/', home);
app.use('/', auth);
app.use('/dashboard', dash);

var server = http.createServer(app);
server.listen(process.env.PORT, () => {
    console.log(`Express listening on port ${process.env.PORT}`);
});
