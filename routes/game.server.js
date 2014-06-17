var UUID = require('node-uuid');
module.exports = exports = new gameServer();
function gameServer() {
  this.games = {};
  this.players = {};
  this.host ='';
  this.game_count = 0;
  this.isPlaying = false;
  this.syncInterval = '';
  this.chatroom = {};
}

/**
 * Defined common variables
 */
var syncIntervalTime = 1500;
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
    x_min : 0,
    x_max : 29,
    y_min : 0,
    y_max : 15
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
   * modify user info
   * color:
   * nickname:
   */
  client.on('modifyUserInfo', function(data){
    that.onModifyUserInfo(client, data);
  });
  
  
  /**
   * player ready
   */
  client.on('ready', function(){
    that.onReady(client);
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
   * Disconnect event
   */
  /*client.on('disconnect', function() {
    o_gameServer.onDisconnected(client);
  });*/
  
  /**
   * TODO leave, finish game
   * clearInterval(gameServer.syncInterval);
   * gameServer.syncInterval = null;
   * leave channel "Game Room"
   */
  

};

gameServer.prototype.onModifyUserInfo = function(client, data){
  gameServer.players[client.uuid].color = data.color;
  gameServer.players[client.uuid].nickname = data.nickname;
  console.log("\t socket.io:: player:"+client.uuid+" modify info.", "color:", data.color, "nickname", data.nickname);
};

gameServer.prototype.onReady = function(client){
  gameServer.players[client.uuid].isReady = true;
  console.log("\t socket.io:: player:"+client.uuid+" is ready.");
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
   * broadcast all player info every syncIntervalTime
   */
  gameServer.syncInterval = setInterval(function(){
    io.sockets.emit('gamePlayerInfo', that.chatroom);
  }, syncIntervalTime);
};

gameServer.prototype.onPlayerMoved = function(client, data) {
  if(this.isPlaying){
    console.log("\t socket.io:: player:", client.uuid, "action:", data.direct);
    
    var o = this.games[client.uuid];
    o.old_pos.x = o.pos.x;
    o.old_pos.y = o.pos.y;
    console.log("\t socket.io:: player:" , client.uuid,
        "old position ( x , y ) = ", "(",o.old_pos.x, ",",o.old_pos.y,")");
    
    switch(data.direct){
    case 'up':
      if((o.pos.y-1)>=o.pos_limits.y_min){
        o.pos.y--;
      }
      break;
    case 'down':
      if((o.pos.y+1)<=o.pos_limits.y_max){
        o.pos.y++;
      }
      break;
    case 'left':
      if((o.pos.x-1)>=o.pos_limits.x_min){
        o.pos.x--;
      }
      break;
    case 'right':
      if((o.pos.x+1)<=o.pos_limits.x_max){
        o.pos.x++;
      }
      break;
    }
    console.log("\t socket.io:: player: " + client.uuid +
        " new position ( x , y ) = ", "(",o.pos.x,",",o.pos.y,")");
    o.direct = data.direct;
  }
};

gameServer.prototype.onDisconnected = function(client) {
  console.log('\t socket.io:: client disconnected ' + client.uuid);
  delete this.players[client.uuid];
  if(gameServer.isPlaying){
    delete gameServer.games[client.uuid];
  }
};

gameServer.prototype.setChatroom = function(chatroom){
  this.chatroom = chatroom;
}