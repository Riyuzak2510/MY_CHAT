'use strict'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const express = require('express')
const session = require('express-session')
const path = require('path')
const cookieParser = require('cookie-parser')
const indexpage = require('./routes/index')
const config = require('./config/config')
const connectMongo = require('connect-mongo')(session)
const mongoose = require('mongoose')
mongoose.connect(config.dbURL)
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
const https = require('https')
const fs = require('fs')
const socketio = require('socket.io')
const app = express()
const options = {
  cert: fs.readFileSync(__dirname + '/certificates/cert.pem'),
  key: fs.readFileSync(__dirname + '/certificates/key.pem')
}
var rooms = []

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.set('views',path.join(__dirname,'views'))
app.engine('html',require('hogan-express'))
app.set('view engine','html')
app.use(express.static(__dirname + "/public"))
app.use(cookieParser())

var env1 = process.env.NODE_ENV || 'development';
if(env1 === 'development')
{
    app.use(session({
        secret: config.sessionSecret
    }))
}
else {
    app.use(session({
        secret: config.sessionSecret,
        store: new connectMongo({
            mongoose_connection: mongoose.connections[0],
            stringify: true
        })
    }))
}

app.use(passport.initialize())
app.use(passport.session())

require('./auth/passportAuth')(passport,FacebookStrategy,config,mongoose)

require('./routes/index')(express,app,passport,config,rooms)

app.set('port',process.env.PORT || 1759)
const server = https.createServer(options, app);
const io = socketio.listen(server)


require('./socket/socket.js')(io,rooms)

server.listen(app.get('port'),function(){
    console.log("MY_CHAT working on https://localhost:" + app.get('port'))
    console.log("Mode: " + env1)
})