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
var syncIntervalTime = 500;
var Player = function(playerSocket) {
 
  this.instance = playerSocket;

  // Set up initial values for our state information
  this.pos = {
    x : 0,
    y : 0
  };

  this.color = 'rgba(255,255,255,0.1)';
  this.nickname = '';
  this.uuid = '';
  this.direct = '';
  
  this.old_state = {
    pos : {
      x : 0,
      y : 0
    }
  };
  
  this.isReady = false;
  this.isDead = false;

  // Our local history of inputs
  this.inputs = [];

  // position limits
  this.pos_limits = {
    x_min : 8,
    x_max : 391,
    y_min : 8,
    y_max : 391
  };
  
  // initial player information
  if (this.instance) {
    this.pos = {
      x : Math.floor(Math.random() * (this.pos_limits.x_max - this.pos_limits.x_min + 1)) + this.pos_limits.x_min,
      y : Math.floor(Math.random() * (this.pos_limits.y_max - this.pos_limits.y_min + 1)) + this.pos_limits.y_min,
    };
    this.uuid = this.instance.uuid;
  }

}; // game_player.constructor


var io; // socket io from app.js
/**
 * socket io enter point
 */
gameServer.prototype.initGameEvent = function(sio, client, chatroom) {
  io = sio; // io
  var that = this;
  that.setChatroom(chatroom);
  
  console.log('\t socket.io:: player:' + client.uuid + ' connected.');
  
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
  
  /**
   * broadcast all player info every syncIntervalTime until game over
   */
  // this.syncInterval = setInterval(function(){
  //   if (that.isPlaying) {
  //     that.checkGameOver();
  //     io.sockets.emit('gamePlayerInfo', that.chatroom);
  //   }
  //   else {
  //     // Developing, don't go game over
  //     // console.log("\t game over");
  //     // io.sockets.emit('gameOverAndWinnerInfo', that.winner);
  //     // clearInterval(that.syncInterval);
  //     // that.syncInterval = null;
  //   }
  // }, syncIntervalTime);
};

gameServer.prototype.onPlayerMoved = function(client, data) {
  if(this.isPlaying&&this.games[client.uuid]){
    console.log("\t socket.io:: player:", client.uuid, "action:", data.direct);
    
    var o = this.games[client.uuid];
    o.old_pos.x = o.pos.x;
    o.old_pos.y = o.pos.y;
    console.log("\t socket.io:: player:" , client.uuid,
        "old position ( x , y ) = ", "(",o.old_pos.x, ",",o.old_pos.y,")");
    
    var aStep = 8; // pixels per step
    switch(data.direct){
    case 'up':
      if((o.pos.y-aStep)>=o.pos_limits.y_min){
        o.pos.y -= aStep;
      }
      break;
    case 'down':
      if((o.pos.y+aStep)<=o.pos_limits.y_max){
        o.pos.y += aStep;
      }
      break;
    case 'left':
      if((o.pos.x-aStep)>=o.pos_limits.x_min){
        o.pos.x -= aStep;;
      }
      break;
    case 'right':
      if((o.pos.x+aStep)<=o.pos_limits.x_max){
        o.pos.x += aStep;;
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
      attackableY = y - 1;
      break;
    case 'down':
      attackableX = x;
      attackableY = y + 1;
      break;
    case 'left':
      attackableX = x - 1;
      attackableY = y;
      break;
    case 'right':
      attackableX = x + 1;
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
