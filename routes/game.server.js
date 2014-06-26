var UUID = require('node-uuid');
module.exports = exports = new gameServer();
function gameServer() {
  this.games = {};
  this.players = {};
  this.isPlaying = false;
  this.syncInterval = '';
  this.chatroom = {};
  this.winner = null;
}

/**
 * Defined common variables
 */
var oneStep = 5; // pixels per step
var io; // socket io from app.js
/**
 * socket io enter point
 */
gameServer.prototype.initGameEvent = function(sio, client, chatroom) {
  io = sio; // io
  var that = this;
  that.setChatroom(chatroom);
  
  console.log('\t socket.io:: player:' + client.uuid + ' connected.');
  
  client.on('check game playing', function(data, fn){
      fn(that.isPlaying);
  });
  
  /**
   * join game
   */
  client.on('init game', function() {
    that.onInitGame(client);
  });

  /**
   * Player move event
   */
  client.on('playerMoved', function(data) {
    that.onPlayerMoved(client, data);
  });

  /**
   * Player attack event
   */
  client.on('playerAttack', function() {
    that.onPlayerAttack(client);
  });
  
  client.on('disconnect', function(){
    that.onDisconnect(client);
  });
  
  /**
   * TODO leave, finish game
   * clearInterval(gameServer.syncInterval);
   * gameServer.syncInterval = null;
   * leave channel "Game Room"
   */
  

};

gameServer.prototype.onInitGame = function(client) {
  console.log("\t socket.io:: host "+client.uuid+" start game.");
  
  var that = this;
  
  // Join all ready users in gameServer.games
  for(var i=0; i<that.chatroom.playerList.length; i++){ 
    if(that.chatroom.playerList[i].isPlay){
      var uuid = that.chatroom.playerList[i].uuid;
      console.log("\t socket.io:: player:", uuid, "join game.");
      that.games[uuid] = that.chatroom.playerList[i]; 
      that.games[uuid].randomPos();
    }
  }
  
  // broadcast join game players
  io.sockets.emit('start game', that.chatroom);

  this.isPlaying = true;
};

gameServer.prototype.onPlayerMoved = function(client, data) {
  if(this.isPlaying&&this.games[client.uuid]){
    console.log("\t socket.io:: player:", client.uuid, "action:", data.direct);
    
    var o = this.games[client.uuid];
    o.old_pos.x = o.pos.x;
    o.old_pos.y = o.pos.y;
    console.log("\t socket.io:: player:" , client.uuid,
        "old position ( x , y ) = ", "(",o.old_pos.x, ",",o.old_pos.y,")");
    
    switch(data.direct){
    case 'up':
      if((o.pos.y-oneStep)>=o.pos_limits.y_min){
        o.pos.y -= oneStep;
      }
      break;
    case 'down':
      if((o.pos.y+oneStep)<=o.pos_limits.y_max){
        o.pos.y += oneStep;
      }
      break;
    case 'left':
      if((o.pos.x-oneStep)>=o.pos_limits.x_min){
        o.pos.x -= oneStep;;
      }
      break;
    case 'right':
      if((o.pos.x+oneStep)<=o.pos_limits.x_max){
        o.pos.x += oneStep;;
      }
      break;
    }
    console.log("\t socket.io:: player: " + client.uuid +
        " new position ( x , y ) = ", "(",o.pos.x,",",o.pos.y,")");
    o.direct = data.direct;

    io.emit('update players', {players: this.chatroom.playerList});
  }
};


gameServer.prototype.onPlayerAttack = function(client) {
  if(this.isPlaying){
    console.log("\t socket.io:: player:", client.uuid, "action: attack");

    var o = this.games[client.uuid];
    console.log("\t socket.io:: player:" , client.uuid,
        "position ( x , y ) = ", "(",o.pos.x, ",",o.pos.y,")");
    
    var x = o.pos.x;
    var y = o.pos.y;
    var attackableX, attackableY;

    switch (o.direct) {
    case 'up':
      attackableX = x;
      attackableY = y - oneStep;
      break;
    case 'down':
      attackableX = x;
      attackableY = y + oneStep;
      break;
    case 'left':
      attackableX = x - oneStep;
      attackableY = y;
      break;
    case 'right':
      attackableX = x + oneStep;
      attackableY = y;
      break;
    }

    for (var uuid in this.games) {
      var player = this.games[uuid];
      if (player.pos.x == attackableX && player.pos.y == attackableY) {
          console.log("\t socket.io:: attacked player:" , client.uuid,
              "position ( x , y ) = ", "(",attackableX, ",",attackableY,") is dead");
        player.isDead = true;
        break;
      }
    }

  }
};

gameServer.prototype.onDisconnect = function(client) {
    if(this.isPlaying){
        delete this.games[client.uuid];
        if(Object.keys(this.games).length === 0){
            this.isPlaying = false;
            console.log("all players leave game, game end.");
        }
    }
};

gameServer.prototype.checkGameOver = function() {
  var alive = null;
  var gameOver = true;
  for (var uuid in this.games) {
    var player = this.games[uuid];
    if (player.isDead){
      continue;
    }
    //first one alive: maybe the winner
    if (alive == null) {
      alive = player;
    }
    //second one alive: game is not over
    else {
      gameOver = false;
      break;
    }
  }
  if (gameOver) {
    this.isPlaying = false;
    this.winner = alive;
  }
};

gameServer.prototype.setChatroom = function(chatroom){
  this.chatroom = chatroom;
}
gameServer.prototype.playerOut = function(player){
    io.sockets.emit('removePlayer', {room:this.chatroom, play:player});
}
