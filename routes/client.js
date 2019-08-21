const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const GrifFsStorage = require('multer-gridfs-storage');
const GridFsStream = require('gridfs-stream');
const mongoose = require('mongoose');
const TimeHelper = require('../helpers/time');
const Moment = require('moment');

// const {News} = require('../models/news');
const {Client} = require('../models/client');
const {Music} = require('../models/music')
const Config = require('../config/config');
var {ObjectID} = require('mongodb');

const storage = new GrifFsStorage({
    url: Config.dbUrl,
    file: (request, file) => {
        return {
            filename: request.body.clientName + path.extname(file.originalname),
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
        response.render('artist', {results: items});
   })
   .catch((err)=> {
        console.log("error message", err)
   })
});;

function FetchItems() {
    return new Promise((resolve, reject) => {
     let Items = {
         latestClients: [],
         latestSongs: []
     }
     Client.find({})
        .sort({date: 'descending'})
        .exec(function(err, docs) {
            if(!err) {
                Items.latestClients = docs;
                // resolve(Items)
                console.log(docs)
                Music.find({})
                    .sort({date: 'descending'})
                    .limit(10)
                    .exec(function(err, docs) {
                        if(!err) {
                            Items.latestSongs = docs;
                            resolve(Items);
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

router.post('/add', upload.single('file'), (request, response) => {
    var client = new Client({
        clientName: request.body.clientName,
        clientWeb: request.body.clientWeb,
        clientPhoto: request.file.filename,
        clientPhotoId: request.file.id,
        clientMsg: request.body.clientMsg
    });
    client.save().then((res) => {
        console.log('Uploaded successfully', res);
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
    Client.find()
    .then((clients) => {
        response.send(clients);
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

    Client.findById(id).then((client) => {
        if(!client) {
           return response.status(400).send();
        }

        response.status(200).send({client});
    }).catch((e) => {
        response.status(400).send();
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