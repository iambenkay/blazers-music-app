var mongoose = require('mongoose');

var News = mongoose.model('News', {
    newsTitle: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    newsThumbnailId: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    newsMessage: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    newsThumbnail: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    newsView: {
        type: Number,
        default: 0
    },
    newsDate: {
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

News.createIndexes({NewsTitle: 'text'});

module.exports = {News};