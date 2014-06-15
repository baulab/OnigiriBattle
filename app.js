
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , chatroom = require('./routes/chatroom')
  , Player = require('./routes/player')
  , http = require('http')
  , path = require('path')
  , socket = require('socket.io');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = socket.listen(server);

io.on('connection', function(socket) {
    console.log('new player connected');

    socket.on('init player', function(player) {
        // Retain new player
        var newplayer = new Player(player.name, player.color);
        socket.player = newplayer;
        chatroom.addPlayer(newplayer);

        // Notify client player joined
        io.emit('player joined', {'chatroom': chatroom, 'newPlayer': newplayer});
        console.log('player %s joined', newplayer.name);
    });

    socket.on('disconnect', function() {
        if (!socket.player) {
            // When server crash, client reconnect
            console.log('dead socket disconnected');
            return;
        }
        
        // Remove player from players
        chatroom.removePlayer(socket.player.name);
        
        // Notify client player left.
        io.emit('player left', {'chatroom': chatroom, 'exitPlayer': socket.player});
        
        console.log(socket.player.name + ' disconnected');
    });
    
    socket.on('update play status', function(isPlay) {
        socket.player.setPlay(isPlay);
        chatroom.updatePlayer(socket.player);
        io.emit('update play status', {'chatroom': chatroom, 'updatePlayer': socket.player})
    });
    
    socket.on('chat message', function(msg) {
        if (!socket.player) {
            // When server crash, client reconnect
            console.log('dead socket disconnected');
            return;
        }
        
        console.log(socket.player.name + ': ' + msg);
        io.emit('chat message', socket.player.name + ': ' + msg);
    });
    
    socket.on('game finish', function(obj){
    	io.emit('game finish', obj);
    });
});
