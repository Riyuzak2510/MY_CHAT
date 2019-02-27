module.exports = function(passport,FacebookStrategy,config,mongoose){

    const ChatUser = new mongoose.Schema({
        ProfileID: String,
        Fullname: String,
        Profilepic: String,
        Email: String
    })

    const userModel = mongoose.model('ChatUser',ChatUser)

    passport.serializeUser(function(user,done){
        done(null,user.id)
    })

    passport.deserializeUser(function(id,done){
        userModel.findById(id,function(err,user){
            done(err,user)
        })
    })
    passport.use(new FacebookStrategy({
        clientID: config.fb.appID,
        clientSecret: config.fb.appSecret,
        callbackURL: config.fb.callbackURL,
        proxy: true,
        ProfileFields: ['id','displayName','photos']
    }, function(accessToken,refreshToken,profile,done) {
        userModel.findOne({'ProfileID': profile.id},function(err,result){
            if(result)
            {
                done(null,result)
            }
            else {
                var newChatUser = new userModel({
                    ProfileID:profile.id,
                    Fullname:profile.displayName,
                    Profilepic:profile.photos ? profile.photos[0].value : ''
                })
                console.log(newChatUser.Fullname)
                newChatUser.save(function(err) {
                    done(null,newChatUser)
                })
            }
        })
    }))
}