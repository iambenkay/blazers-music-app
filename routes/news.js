const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const GrifFsStorage = require('multer-gridfs-storage');
const GridFsStream = require('gridfs-stream');
const mongoose = require('mongoose');
const TimeHelper = require('../helpers/time');
const Moment = require('moment');

const {News} = require('../models/news');
const {Event} = require('../models/event');
const {Video} = require('../models/video')
const Config = require('../config/config');
var {ObjectID} = require('mongodb');

const storage = new GrifFsStorage({
    url: Config.dbUrl,
    file: (request, file) => {
        return {
            filename: request.body.newsTitle + path.extname(file.originalname),
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

router.get('/:page', (request, response) => {
    let items_per_page = 5;
    let page = (request.params.page > 1) ? request.params.page : 1;
    FetchItems()
    .then((items) => {
        let startIndex;
        if(page > 1) {
            if(page > 2){
                startIndex = (items_per_page *( Number(page) - 1)) + (Number(page) -1);
            } else {
                startIndex = (items_per_page *( Number(page) - 1)) + 1;
            }
        } else {
            startIndex = items_per_page *( page - 1);
        }
        let endIndex = startIndex + items_per_page;
        let pageCount = (Number(items.latestNews.length) / Number(items_per_page)).toFixed(0)
        let paginate = {
            page: page,
            pageCount: pageCount
        }
        items.latestNews = items.latestNews.slice(startIndex, endIndex)
        console.log('NEWS', items.latestNews)
        response.render('news', {results: items, pagination: paginate});
   })
   .catch((err)=> {
        console.log("error message", err)
   })
});;

function FetchItems() {
    return new Promise((resolve, reject) => {
     let Items = {
         latestNews: [],
         latestEvents: [],
         latestVideos:[]
     }
     News.find({})
        .sort({date: 'descending'})
        .exec(function(err, docs) {
            if(!err) {
                docs.map((x) => {
                    x.newsMessage = x.newsMessage.slice(0, 50);
                    x.momentTime = TimeHelper.RelativeTime(x.timeStamp);
                })
                Items.latestNews = docs;
                
                Event.find({})
                    .sort({date: 'descending'})
                    .limit(3)
                    .exec(function(err, docs) {
                        if(!err) {
                            Items.latestEvents = docs;

                            Video.find({})
                                .sort({date: 'descending'})
                                .limit(3)
                                .exec(function(err, docs) {
                                    if(!err) {
                                        Items.latestVideos = docs;
                                        resolve(Items);

                                    } else {
                                        reject(err);
                                    }
                                })
                        } else {
                            reject(err);
                        }
                    })
               } else {
                   reject(err);
               }
        });
 })
}

router.post('/add',  upload.single('file'), (request, response) => {
    var news = new News({
        newsThumbnail: request.file.filename,
        newsThumbnailId: request.file.id,
        newsTitle: request.body.newsTitle,
        newsMessage: request.body.newsMessage,
        timeStamp: TimeHelper.CurrentTime().toString()
    });
    news.save().then((res) => {
        console.log('Uploaded Successfully', res);
        response.send({
            "success" : true
        });
    }).catch((e) => {
        console.log('Upload error', e);
        response.send({
            "success" : false
        });
    });
});
router.get('/fetch/all', (request, response) => {
    News.find()
    .then((news) => {
        response.send(news);
    }).catch((e) => {
        response.send({
            "success": false
        });
    });
});

router.get('/id/:id', (request, response) => {
    // gfs.files.find({
    //     _id = request.params.id;
    // }).toArray((err, file) => {
    //     if (err) {
    //         return response.send(err);
    //         //Todo flash this error
    //     }
    //     const readstream = gfs.createReadStream(request.params.id);
    //     readstream.pipe(response);
    // });
    var id = request.params.id;

    if(!ObjectID.isValid(id)) {
        return response.status(400).send();
    }
    // News.findById(id)
    //     .exec(function (err, doc) {
    //         if(!err) {
    //             doc.momentTime
    //         }
    //     })

    News.findById(id).then((news) => {
        if(!news) {
           return response.status(400).send();
        }

        
        news.momentTime = TimeHelper.RelativeTime(news.timeStamp);
        response.render('event-detail', {result: news});
    }).catch((e) => {
        response.status(400).send();
    })

 });

 router.put('/:id', (request, response) => {
    News.findOneAndUpdate({_id : request.params.id}, {$inc: {newsView: 1}})
        .then((successMessage) => {
            res.send({successMessage});
            console.log(successMessage);
            //Todo: flash this message
        })
        .catch((e) => {
            res.send(e);
            console.log(e);
            //Todo: flash this message
        });
});

router.get('/img/:filename', (request, response) => {
    gfs.files.find({
        filename: request.params.filename
    }).toArray((err, file) => {
        if (err) {
            return response.send(err);
            //Todo flash this error
        }
        console.log("fileeeeeee",file)   
        const readstream = gfs.createReadStream(request.params.filename);
        readstream.pipe(response);
    });
 });
module.exports = router;