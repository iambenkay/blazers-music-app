const express = require('express');
const router = express.Router();
const path = require('path');
var {Music} = require('../models/music');
var Axios = require('axios');
var Config = require('../config/config');

router.get('', (request, response) => {
    FetchItems()
    .then((items)=> {
        response.render('contact', {results: items});
    })
    .catch((err) => {
        console.log("error message", err);
    });
})

function FetchItems() {
    return new Promise((resolve, reject) => {
        let Items = {
            latestSongs: []
        }
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
                    })
    })
}

router.post('/subscribe', (request, response) => {
    console.log(request.body.email)
    // response.redirect('/contact');
    let data = {
        email: request.body.email,
    }

    let headers = {
        'Authorization': Config.sendGridApiKey,
        'Content-Type': 'application/json'
      }

    Axios.post(Config.sendGridContactEndPoint, 
        [{
            email: request.body.email,
        }], 
        {
        headers: {
            'Authorization': 'Bearer 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'
          }
      })
      .then((res) => {
        console.log(res.data);
        console.log(res.status);
        console.log(res.statusText);
        console.log(res.headers);
        console.log(res.config);
        response.redirect('/contact');
      })
      .catch((error) => {
        console.log("error", error.response.data);
        response.redirect('/contact');
      })

    // Axios.post(Config.sendGridContactEndPoint, d)  
})
module.exports = router;