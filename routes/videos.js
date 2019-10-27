const express = require('express');
const router = express.Router();
const path = require('path');
const {isAuthenticated} = require('./')
const multer = require('multer');
const GrifFsStorage = require('multer-gridfs-storage');
const GridFsStream = require('gridfs-stream');
const mongoose = require('mongoose');

const Time = require('../helpers/time');
const {Video} = require('../models/video');
const {Music} = require('../models/music');
const Config = require('../config/config');

const storage = new GrifFsStorage({
    url: Config.dbUrl,
    file: (request, file) => {
        return {
            filename: request.body.videoTitle + path.extname(file.originalname),
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
        response.render('videos', {results: items});
   })
   .catch((err)=> {
        console.log("error message", err)
   })
});;

function FetchItems() {
    return new Promise((resolve, reject) => {
     let Items = {
         latestVideos: [],
         latestSongs: []
     }
     Video.find({})
        .sort({date: 'descending'})
        .exec(function(err, docs) {
            if(!err) {
                Items.latestVideos = docs;
                // resolve(Items)
                Music.find({})
                .sort({timeStamp: 'descending'})
                .limit(10)
                .exec(function(err, docs) {
                    if(!err) {
                        Items.latestSongs = docs;
                        resolve(Items);
                    } else {
                        reject(err);
                    }
                });
               } else {
                   reject(err);
               }
        });
 })
}

router.post('/add', isAuthenticated, upload.single('file'), (request, response) => {
    var video = new Video({
        videoThumbnail: request.file.filename,
        videoThumbnailId: request.file.id,
        videoName: request.body.videoName,
        videoArtist: request.body.videoArtist,
        videoText: request.body.videoText,
        videoCategory: request.body.videoCategory,
        videoUrl: request.body.videoUrl,
        timeStamp: Time.CurrentTime().toString()
    });
    video.save().then((res) => {
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
    Video.find()
    .then((video) => {
        response.send(video);
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

    Video.findById(id).then((video) => {
        if(!video) {
           return response.status(400).send();
        }

        response.status(200).send({video});
    }).catch((e) => {
        response.status(400).send();
    })

 });

 router.put('/:id', (request, response) => {
    video.findOneAndUpdate({_id : request.params.id}, {$inc: {videoView: 1}})
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
