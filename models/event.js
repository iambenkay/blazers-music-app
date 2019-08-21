var mongoose = require('mongoose');

var Event = mongoose.model('Events', {
    eventName: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    eventThumbnailId: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    eventTime: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    eventType: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    eventVenue: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    eventUrl: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    eventThumbnail: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    eventDay: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    eventMonth: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    eventStartTime: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    eventStopTime: {
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

Event.createIndexes({eventName: 'text'});

module.exports = {Event};