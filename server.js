//Dependencies
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');

//express Instance declaration
const app = express();

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

app.listen(config.port, () => {
    console.log(`Started music-app-api on port ${config.port}`);
});

module.exports = {app};