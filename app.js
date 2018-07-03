const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const db_config = require('./config/db');

mongoose.connect(db_config.database);

var db = mongoose.connection;

// check for db connection and db errors
db.once('open', function(){ console.log('Connected to MongoDB.'); });
db.on('error', function(err){ console.log(err); });

const app = express();

// Connect Model files
var Users = require('./models/user');

// Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false })) // parse application/x-www-form-urlencoded
app.use(bodyParser.json()) // parse application/json

// set public folder (for css, js etc files)
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}))

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

        while(namespace.length){
            formParam += '['+namespace.shift()+']';
        }
        return{
            param : formParam,
            msg : msg,
            value : value
        };
    }
}));

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
    res.locals.user = req.user || null;
    next();
});

// Home route
app.get('/', function(req, res){
    res.render('index', {
        title:'Node Chat App'
    });
});

// Route Files
var users = require('./routes/users');
app.use('/users', users);

// Start server
app.listen('3002', function(){
    console.log('Server started on port 3002...');
});
