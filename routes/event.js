const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const GrifFsStorage = require('multer-gridfs-storage');
const GridFsStream = require('gridfs-stream');
const mongoose = require('mongoose');
const Time = require('../helpers/time');
const {Event} = require('../models/event');
const {Music} = require('../models/music');
const Config = require('../config/config');
const Moment = require('moment');
var {ObjectID} = require('mongodb');


const storage = new GrifFsStorage({
    url: Config.dbUrl,
    file: (request, file) => {
        return {
            filename: request.body.eventTitle + path.extname(file.originalname),
        };
    }
});
// console.log(Time.RelativeTime('2019-08-15T18:26:24+01:00'))

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
        response.render('events', {results: items});
   })
   .catch((err)=> {
        console.log("error message", err)
   })
});;

function FetchItems() {
    return new Promise((resolve, reject) => {
     let Items = {
         latestEvents: [],
         previousEvents: []
     }
     Music.find({})
     .sort({timeStamp: 'descending'})
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
                        // Items.previousEvents = docs.map((x) => {
                        //     if(Moment(docs.timeStamp).isBefore(Time.CurrentTime())) {
                        //         return x;
                        //     }
                        // });
                        resolve(Items)
                       } else {
                           reject(err);
                       }
                    })
                }
            })
 })
}

router.post('/add',  upload.single('file'), (request, response) => {
    var event = new Event({
        eventThumbnail: request.file.filename,
        eventThumbnailId: request.file.id,
        eventName: request.body.eventName,
        eventTime: request.body.eventTime,
        eventType: request.body.eventType,
        eventVenue: request.body.eventVenue,
        eventUrl: request.body.eventUrl,
        eventDay: request.body.eventDay,
        eventMonth: request.body.eventMonth,
        eventStartTime: request.body.eventStartTime,
        eventStopTime: request.body.eventStopTime,
        timeStamp: Time.CurrentTime().toString()
    });
    event.save().then((res) => {
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
router.get('/all', (request, response) => {
    Event.find()
    .then((event) => {
        response.send(event);
    }).catch((e) => {
        response.send({
            "success": false
        });
    });
});

router.get('/:id', (request, response) => {
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

    Event.findById(id).then((event) => {
        if(!event) {
           return response.status(400).send();
        }
        // response.status(200).send(event)

        response.render('event-detail', {result: event});
    }).catch((e) => {
        response.status(400).send();
    })

 });

 router.put('/:id', (request, response) => {
    event.findOneAndUpdate({_id : request.params.id}, {$inc: {eventView: 1}})
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
