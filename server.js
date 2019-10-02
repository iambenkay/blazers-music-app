//Dependencies
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
const moment = require('moment');
const cors = require("cors")
const paginate = require('handlebars-paginate')
const Handlebars = require('hbs')

var music = require('./routes/music');
var client = require('./routes/client');
var event = require('./routes/event');
var news = require('./routes/news');
var videos = require('./routes/videos');
var home = require('./routes/home');
var contact = require('./routes/contact');

//express Instance declaration
const app = express();

app.use(cors())
//local configuration file
const config = require('./config/config');

//mongodb connection
mongoose.Promise = global.Promise;
mongoose.connect(config.dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log('Database is connected and running');
}).catch((e) => {
    console.log('DatabaseError', e);
});

//body parser middleware
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

//middleware-view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
Handlebars.registerHelper('paginate', paginate);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/music', music);
app.use('/client', client);
app.use('/event', event);
app.use('/news', news);
app.use('/videos', videos);
app.use('/contact', contact);
app.use('', home);

// var relativeTime = moment('2019-08-15T18:05:06+01:00').fromNow();
// console.log("nw",relativeTime)

app.listen(config.port, () => {
    console.log(`Started music-app-api on port ${config.port}`);
});

module.exports = {app};
