const moment = require('moment');

var classTime = {}

classTime.CurrentTime = function() {
    return moment().format();
}

classTime.RelativeTime = function(dbTime) {
    console.log('DB TIME', dbTime)
    return moment(dbTime).fromNow();
}
    // static RelativeTime(time) {
    //     return moment(time).fromNow();
    // }

    // static CurrentTime() {
    //     return moment().format();
    // }



module.exports = classTime;
