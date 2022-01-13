var express = require("express")
var app = express()
var auth = require('./auth.js');
var db = require('./db')

var port = process.env.PORT || 3000

app.listen(port, () => {
    console.log("Node is listening on " + port + "...")
})

function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}

app.get('/', (req, res) => {
    console.log("Connected!")
    res.send(`Connected to Rupeswar's Server!!`)
})

app.use(express.json())

app.post('/api/test', (req, res) => {
    console.log(req.body)
    res.json({ message: `ok` })
})

app.post('/verifyIdToken', async (req, res) => {
    var payload = (await auth.verifyIdToken(req.body.token))
    var isIdTokenValid = (payload != null)
    var response = { isIdTokenValid: isIdTokenValid }
    if(isIdTokenValid) {
        var user = await db.getUser(payload)
        console.log(user)
        console.log(user.toJSON())
        var isUserNameDefined = (user.userName != undefined)
        response.isUserNameDefined = isUserNameDefined
        response.user = db.getJSON(user)
        console.log(response.user)
        req.user = user
        req.userJSON = response.user
    }
    res.json(response)
})

app.post('/setUserName', isLoggedIn, async (req, res) => {
    req.userJSON = await db.setUserName(req.user, req.body.userName)

    res.json({message: "success", user: req.userJSON})
})