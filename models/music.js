var mongoose = require('mongoose');

var Music = mongoose.model('Music', {
    musicId: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    musicFileName: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    musicName: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    musicArtist: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    musicText: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    musicCategory: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    musicThumbnail: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    musicThumbnailId: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    musicStreams: {
        type: Number,
        default: 0
    },
    musicDate: {
        type: Number,
        default: Date.now()
    },
    timeStamp: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    }
});

Music.createIndexes({musicName: 'text'});

module.exports = {Music};