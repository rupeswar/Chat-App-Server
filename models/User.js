var mongoose = require('mongoose')
var { isEmail } = require('validator')

mongoose.connect(process.env.MONGO_USERS, { useNewUrlParser: true, useUnifiedTopology: true })

const Schema = mongoose.Schema

let userSchema = new Schema({
    gmail: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Please enter a valid email']
  },
    userName: {
        type: String,
        unique: true
    }
})

userSchema.statics.createUser = async function(payload) {
    let user = User({
        gmail: payload['email']
    })

    return await user.save()
}

userSchema.statics.getUser = async function(payload) {
    let user = await this.findOne({gmail: payload['email']}).exec()

    if(user == null)
        user = await this.createUser(payload)
    
    return user
}

userSchema.methods.toSimplifiedJSON = function() {
    var JSON = this.toJSON()
    JSON.id = this.id
    delete JSON._id
    delete JSON.__v

    return JSON
}

userSchema.methods.setUserName = async function(userName) {
    this.userName = userName
    await this.save()
    return this.toSimplifiedJSON()
}

let User = mongoose.model("user", userSchema)

module.exports = User