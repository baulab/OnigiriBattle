
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , chatroom = require('./routes/chatroom')
  , Player = require('./routes/player')
  , gameServer = require('./routes/game.server')
  , http = require('http')
  , path = require('path')
  , socket = require('socket.io')
  , UUID = require('node-uuid');
  
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
    socket.uuid = UUID();
    
    socket.emit('onconnected', {uuid: socket.uuid});
    
    socket.on('init player', function(player) {
        // Retain new player
        var newplayer = new Player(player.name, player.color, socket.uuid, socket);
        socket.player = newplayer;
        chatroom.addPlayer(newplayer);

        // Notify client player joined
        io.emit('player joined', {'chatroom': chatroom, 'newPlayer': newplayer});
        console.log('player %s joined', newplayer.name);
    });
    
    gameServer.initGameEvent(io, socket, chatroom);
    
    socket.on('disconnect', function() {
      // Remove player from players
        if (!socket.player) {
            // When server crash, client reconnect
            console.log('dead socket disconnected');
            return;
        }

        chatroom.removePlayer(socket.player.name);
        
        // Notify client player left.
        io.emit('player left', {'chatroom': chatroom, 'exitPlayer': socket.player});
        
        console.log(socket.player.name + ' disconnected');
    });
    
    socket.on('update play status', function(isPlay) {
        console.log("player", socket.uuid, "wants play");
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
        var out = msg.indexOf(socket.player.name+ '->') == 0 ? msg : socket.player.name + ': ' + msg;
        console.log(out);
        io.emit('chat message', {msg:out, from:socket.player});
    });

    socket.on('finish', function(obj){
        gameServer.playerOut(socket.player);
    	io.emit('game finish', {msg:obj,'updatePlayer': socket.player});
    });
    
    socket.on('color list', function(){
        var colors = [];
        for(var i in chatroom.playerList){
            colors.push(chatroom.playerList[i].color);
        }
        console.log(socket.player);
        io.emit('update color', {clr:colors, player:socket.player});
    })
});
