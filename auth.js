const { OAuth2Client } = require('google-auth-library')
var express = require('express')
var router = express.Router()
var User = require('./models/User')

var CLIENT_ID = process.env.GOOGLE_CLIENT_ID
var APP_CLIENT_ID = process.env.APP_CLIENT_ID

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
    }
    res.json(response)
})

router.post('/setUserName', async (req, res) => {
    var user = await User.findById(req.body.id).exec()
    var userJSON = await user.setUserName(req.body.userName)

    res.json({message: "success", user: userJSON})
})

exports.router = router