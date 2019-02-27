module.exports = function(express,app,passport,config,rooms) {
    const route = express.Router()

    route.get('/',function(req,res,next) {
        res.render('index',{title: 'Welcome to MY_CHAT'})
    })

    function securePages(req, res, next){
        if(req.isAuthenticated()){
          next();
        } else {
          res.redirect('/');
        }
      }

    route.get('/auth/facebook', passport.authenticate('facebook'))
    route.get('/auth/facebook/callback', passport.authenticate('facebook',{
        successRedirect: '/chatrooms',
        failureRedirect: '/'
    }))

    route.get('/chatrooms',securePages,(req,res,next) => {
        res.render('chatrooms',{title: 'Chatrooms',user:req.user,config:config})
    })

    route.get('/room/:id',securePages,function(req,res,next){
        var room_name = findtitle(req.params.id)
        res.render('room',{user:req.user, room_number:req.params.id,room_name:room_name,config:config})
    })
    function findtitle(room_id)
    {
        var n = 0
        while(n < rooms.length)
        {
            if(rooms[n].room_number == room_id)
            {
                return rooms[n].room_name
            }
            else
            {
                n++;
            }
        }
    }
    route.get('/setcolor',(req,res,next) => {
        req.session.favColor = 'Red'
        res.send("Setting Favourite Color!")
    })

    route.get('/getcolor',(req,res,next) => {
        res.send('Favourite Color:' + (req.session.favColor===undefined?"Not Found":req.session.favColor))
    })

    app.use('/',route)
}
