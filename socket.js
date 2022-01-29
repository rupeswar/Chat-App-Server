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

        socket.on('test', (msg) => {
            console.log(msg)
        })

        socket.on('user', async (id) => {
            var user = await User.getUserInfoById(id)

            socket.emit('user', user)
        })

        socket.on('add-user', async (userName) => {
            var user = await User.getUserInfoByUserName(userName)

            if(user == null)
                socket.emit('add-user-error', 200)
            else {
                socket.emit('add-user', user)
            }
        })

        socket.on('chats', async (id) => {
            var messages = await Message.getMessages(id)

            socket.emit('chats', messages)
        })

        socket.on('message', async (msg) => {
            if(msg.type = 'Direct') {
                var message = await Message.sendDirectMessage(msg.from, msg.to, msg.message)
                io.directMessage(message)
                socket.emit('message-trigger', message.toSimplifiedJSON())
            }
        })

        socket.on('disconnect', (reason) => {
            console.log(`Connection closed because ${reason}`)
            map.delete(socket.token.id)
        })
    })
}

module.exports = initialiseSocket