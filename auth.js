const { OAuth2Client } = require('google-auth-library')
var express = require('express')
var router = express.Router()
var User = require('./models/User')
var jwt = require('jsonwebtoken')

var CLIENT_ID = process.env.GOOGLE_CLIENT_ID
var APP_CLIENT_ID = process.env.APP_CLIENT_ID
var SERVER_SECRET = process.env.SERVER_SECRET

const client = new OAuth2Client(CLIENT_ID)

async function verifyIdToken(token) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        if (payload == undefined) return null
        const userid = payload['sub'];
        console.log(payload)
        return payload
        // If request specified a G Suite domain:
        // const domain = payload['hd'];
    } catch (e) {
        console.log(e)
        return null
    }
}

const maxAge = 60*60
function createToken(id) {
    return jwt.sign({id}, SERVER_SECRET, {
        expiresIn: maxAge,
        issuer: "Chat App Server"
    })
}

const requireAuth = (req, res, next) => {
    const token = req.body.token
    if(!token)
        res.sendStatus(401)
    jwt.verify(token, SERVER_SECRET, (err, decodedToken) => {
        if(err) {
            console.log(err)
            res.sendStatus(401)
        } else {
            console.log(req.body)
            console.log(decodedToken)
            req.token = decodedToken
            delete req.body.token
            next()
        }
    })
}

const socketAuth = (socket, next) => {
    const token = socket.handshake.auth.token
    if(!token) {
        const error = Error("Not Authorised")
        err.data = {content: "Please provide auth token"}
        next(err)
    }

    jwt.verify(token, SERVER_SECRET, (err, decodedToken) => {
        if(err) {
            console.log(err)
            next(err)
        } else {
            console.log(decodedToken)
            socket.token = decodedToken
            next()
        }
    })
}

router.post('/verifyIdToken', async (req, res) => {
    var payload = (await verifyIdToken(req.body.token))
    var isIdTokenValid = (payload != null)
    var response = { isIdTokenValid: isIdTokenValid }
    if(isIdTokenValid) {
        var user = await User.getUser(payload)
        var isUserNameDefined = (user.userName != undefined)
        response.isUserNameDefined = isUserNameDefined
        response.user = user.toSimplifiedJSON()
        console.log(response.user)
        response.token = createToken(user.id)
        console.log(jwt.verify(response.token, SERVER_SECRET))
    }
    res.json(response)
})

router.post('/setUserName', requireAuth, async (req, res) => {
    console.log(req.token, req.body)
    var user = await User.findById(req.token.id).exec()
    var userJSON = await user.setUserName(req.body.userName)

    res.json({message: "success", user: userJSON})
})

exports.router = router
exports.requireAuth = requireAuth
exports.socketAuth = socketAuth