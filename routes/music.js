const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const GrifFsStorage = require('multer-gridfs-storage');
const GridFsStream = require('gridfs-stream');
const mongoose = require('mongoose');

const {Music} = require('../models/music');
const Config = require('../config/config');
const TimeHelper = require('../helpers/time');

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

// router.get('', (request, response) => {
//     FetchItems()
//     .then((items) => {
//         response.render('songs', {results: items});
//    })
//    .catch((err)=> {
//         console.log("error message", err)
//    })
// });;
router.get('/page/:page', (request, response) => {
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
        let pageCount = (Number(items.allSongs.length) / Number(items_per_page)).toFixed(0)
        let paginate = {
            page: page,
            pageCount: pageCount
        }
        items.allSongs = items.allSongs.slice(startIndex, endIndex)
        console.log('NEWS', items.allSongs)
        response.render('songs', {results: items, pagination: paginate});
   })
   .catch((err)=> {
        console.log("error message", err)
   })
});;

function FetchItems() {
    return new Promise((resolve, reject) => {
     let Items = {
         allSongs: [],
         latestSongs: []
     }
     Music.find({})
        .sort({timeStamp: 'descending'})
        .exec(function(err, docs) {
            if(!err) {
                docs.map((x, idx) => {
                    if (idx > 10) return
                        Items.latestSongs.push(x);
                })
                Items.allSongs = docs;
                console.log("songss", Items.allSongs)
                resolve(Items)
               } else {
                   reject(err);
               }
        });
 })
}

router.post('/add',  upload.array('file', 2), (request, response) => {
    console.log(request.files)
    var music = new Music({
        musicId: request.files[0].id,
        musicFileName: request.files[0].filename,
        musicThumbnail: request.files[1].filename,
        musicThumbnailId: request.files[1].id,
        musicName: request.body.musicName,
        musicArtist: request.body.musicArtist,
        musicText: request.body.musicText,
        musicCategory: request.body.musicCategory,
        timeStamp: TimeHelper.CurrentTime().toString()
    });
    music.save().then((res) => {
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
    Music.find()
    .then((movies) => {
        response.send(movies);
    }).catch((e) => {
        response.send({
            "success": false
        });
    });
});

router.get('/:filename', (request, response) => {
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

router.delete('/:id', (request, response) => {
    gfs.files.remove({_id : request.params.id})
        .then((file) => {
            console.log(file);
            //Todo: flash this message
        })
        .catch((e) => {
            console.log(file);
            //Todo: flash this message
        });
});

router.put('/:id', (request, response) => {
    Music.findOneAndUpdate({_id : request.params.id}, {$inc: {musicStreams: 1}})
        .then((successMessage) => {
            response.send({successMessage});
            console.log(successMessage);
            //Todo: flash this message
        })
        .catch((e) => {
            response.send(e);
            console.log(e);
            //Todo: flash this message
        });
});
module.exports = router;