const { Server } = require('socket.io')
var User = require('./models/User')
var Message = require('./models/Message')
var {socketAuth} = require('./auth')

var map = new Map();

function initialiseSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ['GET', 'POST']
        }
    })

    io.directMessage = (message) => {
        console.log(`Sending ${message}`)
        io.to(map.get(message.to)).emit('message', message.toSimplifiedJSON())
    }

    io.use(socketAuth)
    .on('connection', (socket) => {

        console.log(`Connected to ${socket.id}`)
            map.set(socket.token.id, socket.id)

        socket.on('user', async (id, respond) => {
            var user = await User.getUserInfoById(id)

            respond(user)
        })

        socket.on('add-user', async (userName, respond) => {
            var user = await User.getUserInfoByUserName(userName)

            if(user == null)
                respond("error")
            else
                respond("ok", user)
        })

        socket.on('chats', async (id, respond) => {
            var messages = await Message.getMessages(id)

            respond(messages)
        })

        socket.on('message', async (msg, respond) => {
            if(msg.type = 'Direct') {
                var message = await Message.sendDirectMessage(msg.from, msg.to, msg.message)
                io.directMessage(message)
                respond(message.toSimplifiedJSON())
            }
        })

        socket.on('disconnect', (reason) => {
            console.log(`Connection closed because ${reason}`)
            map.delete(socket.token.id)
        })
    })
}

module.exports = initialiseSocket