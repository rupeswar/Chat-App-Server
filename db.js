var mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const Schema = mongoose.Schema

let userSchema = new Schema({
    gmail: String,
    userName: String
})

let User = mongoose.model("User", userSchema)

async function createUser(payload) {
    let user = User({
        gmail: payload['email']
    })

    return await user.save()
}

async function getUser(payload) {
    let user = await User.findOne({gmail: payload['email']}).exec()

    if(user == null)
        user = await createUser(payload)
    
    return user
}

function getJSON(doc) {
    var obj = doc.toJSON()
    obj.id = doc.id
    delete obj._id
    delete obj.__v

    return obj
}

// var ObjectId = mongoose.Types.ObjectId
async function setUserName(user, userName) {
    if(user != null) {
        user.userName = userName
        await user.save()
        return getJSON(user)
    }
    else {
        console.log("An Error Occurred..")
    }
}

exports.getUser = getUser
exports.getJSON = getJSON
exports.setUserName = setUserName