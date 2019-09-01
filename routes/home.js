const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const GrifFsStorage = require('multer-gridfs-storage');
const GridFsStream = require('gridfs-stream');
const mongoose = require('mongoose');
const TimeHelper = require('../helpers/time');
const Moment = require('moment');
var {ObjectID} = require('mongodb');

const {Client} = require('../models/client');
const {News} = require('../models/news');
const {Music} = require('../models/music');
const {Video} = require('../models/video');
const {Event} = require('../models/event');

const Config = require('../config/config');

const storage = new GrifFsStorage({
    url: Config.dbUrl,
    file: (request, file) => {
        return {
            filename: request.body.musicName + path.extname(file.originalname),
        };
    }
});

const upload = multer({
    storage
});

let gfs
const conn = mongoose.createConnection(Config.dbUrl);
conn.once('open', () => {
    gfs = GridFsStream(conn.db, mongoose.mongo);
});

router.get('', (request, response) => {
   FetchItems()
    .then((items) => {
        response.render('index', {results: items});
   })
   .catch((err)=> {
        console.log("error message", err)
   })
})

function FetchItems() {
   return new Promise((resolve, reject) => {
    let Items = {
        latestVideos: [],
        latestEvents: [],
        latestNews: [],
        latestSongs: []
    }
    Music.find({})
        .sort({date: 'descending'})
        .limit(10)
        .exec(function(err, docs) {
            if(!err) {
                Items.latestSongs = docs;

                Event.find({})
                    .sort({timeStamp: 'descending'})
                    .limit(4)
                    .exec(function(err, docs) { 
                        if(!err) {
                            Items.latestEvents = docs;

                            News.find({})
                                .sort({timeStamp: 'descending'})
                                .limit(4)
                                .exec(function(err, docs) { 
                                    if(!err) {
                                        docs.map((x) => {
                                            x.newsMessage = x.newsMessage.slice(0, 50);
                                            x.momentTime = TimeHelper.RelativeTime(x.timeStamp);
                                        })
                                        console.log(docs)
                                        Items.latestNews = docs;

                                        Video.find({})
                                            .sort({timeStamp: 'descending'})
                                            .limit(3)
                                            .exec(function(err, docs) { 
                                               if(!err) {
                                                docs.map((x) => {
                                                    x.momentTime = TimeHelper.RelativeTime(x.timeStamp);
                                                }) 
                                                Items.latestVideos = docs;
                                                resolve(Items)
                                               } else {
                                                   reject(err);
                                               }
                                             });
                                    } else {
                                        reject(err);
                                    }
                                 });
                        } else {
                            reject(err);
                        }
                     });
            } else {
                reject(err);
            }
        })
   })
}
module.exports = router;