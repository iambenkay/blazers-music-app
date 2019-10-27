const jwt = require('jsonwebtoken')

module.exports.isAuthenticated = (req, res, next) => {
    const auth_header = req.get('authorization')

    if(!auth_header || !auth_header.startsWith('Token ')) return res.status(401).send({error: "Not Authorized"})

    const token = auth_header.split(' ')[1]
    try {
        const payload = jwt.verify(token, "supersecretauthenticationstring")
        if(payload.authorized) return next()
    } catch(error){
        return res.status(401).send({error: "Not Authorized"})
    }
}
