var mongoose = require('mongoose');

var Video = mongoose.model('Movies', {
    videoName: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    videoThumbnailId: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    videoArtist: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    videoText: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    videoCategory: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    videoThumbnail: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    videoUrl: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    timeStamp: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    }
});

Video.createIndexes({videoName: 'text'});

module.exports = {Video};