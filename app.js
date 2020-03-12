require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var flash = require('connect-flash');
var customer_router = require('./routes/customers');
var admin_router = require('./routes/admin');
var passport =require('passport')

var app = express();

mongoose.connect(process.env.mongoDB, { useNewUrlParser: true });
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(passport.session());


app.use(session({
    secret: 'process.env.secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 1000 }
}));
app.use(cookieParser(process.env.secret));

app.use('/', customer_router);
app.use('/admin', admin_router);
app.listen(process.env.PORT || 3000, () => {
    console.log("server is running on port 3000");
});