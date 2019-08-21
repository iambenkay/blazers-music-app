var mongoose = require('mongoose');

var Client = mongoose.model('Clients', {
    clientName: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    clientPhotoId: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    clientWeb: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    clientPhoto: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    clientMsg: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
});

Client.createIndexes({clientName: 'text'});

module.exports = {Client};