const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser')
const http = require('http');
const dotenv = require('dotenv').config();
const validator = require('express-validator');
const sha1 = require('sha1');
const uuid = require('uuid-random');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);

const mysql = require('mysql');
var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'express'
});

con.connect((err) => {
    if (err) throw "Error connecting to database. Make sure the database is online and able to be connected to.";
});

const app = express();

const home = require('./routes/home');
const auth = require('./routes/auth');
const dash = require('./routes/dash');
const posts = require('./routes/posts');
const api = require('./routes/api');

const user = require('./models/user');

const helper = require('./custom_modules/helper');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'X'}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(validator());

db.defaults({users: [], posts: []}).write();

helper.setDatabaseHelpers(db);

app.use('*', (req, res, next) => {
    req.low = low;
    req.db = db;

    req.mysql = con;

    req.sha1 = sha1;
    req.uuid = uuid;
    req.User = user;
    req.helper = helper;
    next();
});

if (process.env.ENVIRONMENT === 'debug')
    app.get('*', (req, res, next) => {
        console.log(`Requesting URL '${req.url}'`);
        next();
    });

app.use('/', home);
app.use('/', auth);
app.use('/dashboard', dash);
app.use('/posts', posts);
app.use('/api', api);

app.use('/', (req, res) => {
    res.redirect('/');
});

var server = http.createServer(app);
server.listen(process.env.PORT, () => {
    console.log(`Express listening on port ${process.env.PORT}`);
});
