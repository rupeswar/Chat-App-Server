const { OAuth2Client } = require('google-auth-library')

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

exports.verifyIdToken = verifyIdToken;