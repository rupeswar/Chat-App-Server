var mongoose = require('mongoose')

var connection = mongoose.createConnection(`${process.env.MONGO_URI}/messages`, { useNewUrlParser: true, useUnifiedTopology: true })

const Schema = mongoose.Schema

let messageSchema = new Schema({
    message: {
        type: String,
        required: [true, 'Please enter a message']
    },
    from: {
        type: String,
        required: [true, `Please enter sender's id`]
    },
    time: {
        type: Number,
        default: Date.now
    }
}, {
    discriminatorKey: 'type'
})

const directMessageSchema = new Schema({
    to: {
        type: String,
        required: [true, `Please enter recipient's id`]
    }
})

messageSchema.statics.sendDirectMessage = async function(from, to, message) {
    let messageDoc = DirectMessage({
        from: from,
        to: to,
        message: message
    })

    return await messageDoc.save()
}

messageSchema.statics.getMessages = async function(uid) {
    let messageDocs = await this.find({to: uid})
    .sort({time: 'asc'})
    .exec()
    let messages = []

    console.log(messageDocs)

    for(messageDoc of messageDocs) {
        console.log(messageDoc)
        messages.push(messageDoc.toSimplifiedJSON())
    }

    return messages
}

messageSchema.methods.toSimplifiedJSON = function() {
    var JSON = this.toJSON()
    JSON.id = this.id
    delete JSON._id
    delete JSON.__v

    return JSON
}

let Message = connection.model('message', messageSchema)

let DirectMessage = Message.discriminator('Direct', directMessageSchema)

module.exports = Message