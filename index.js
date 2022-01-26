var express = require("express")
var app = express()
var { router: authRouter } = require('./auth');
var socket = require('./socket')

var port = process.env.PORT || 3000

const httpServer = app.listen(port, () => {
    console.log("Node is listening on " + port + "...")
})

app.get('/', (req, res) => {
    console.log("Connected!")
    res.send(`Connected to Rupeswar's Server!!`)
})

app.use(express.json())

app.use('/auth', authRouter)

socket(httpServer)