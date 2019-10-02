module.exports = {
    port: process.env.PORT || 5000,
    dbUrl: process.env.MONGODB_URI || "mongodb://localhost:27017/MusicApp",
    sendGridApiKey: 'Bearer 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',
    sendGridContactEndPoint: 'https://api.sendgrid.com/v3/contactdb/recipients',
}
