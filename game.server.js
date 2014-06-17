var UUID = require('node-uuid');
var gameServer = module.exports = {
  games : {},
  players: {},
  host:'',
  game_count : 0,
  isPlaying: false,
  syncInterval: ''
};

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
gameServer.onUserConnected = function(sio, client) {
  io = sio; // io
  client.uuid = UUID();
  
  // tell the player they connected, giving them their id
  client.emit('onconnected', {
    id : client.uuid
  });

  console.log('\t socket.io:: player:' + client.uuid + ' connected.');
  
  /**
   * initial player information
   */
  this.players[client.uuid] = new Player(client);
  
  /**
   * modify user info
   * color:
   * nickname:
   */
  client.on('modifyUserInfo', function(data){
    gameServer.onModifyUserInfo(client, data);
  });
  
  
  /**
   * player ready
   */
  client.on('ready', function(){
    gameServer.onReady(client);
  });
  
  /**
   * join game
   */
  client.on('joinGame', function() {
    gameServer.onJoinGame(client);
  });

  /**
   * Player move event
   */
  client.on('playerMoved', function(data) {
    gameServer.onPlayerMoved(client, data);
  });

  
  /**
   * Disconnect event
   */
  client.on('disconnect', function() {
    gameServer.onDisconnected(client);
  });
  
  /**
   * TODO leave, finish game
   * clearInterval(gameServer.syncInterval);
   * gameServer.syncInterval = null;
   * leave channel "Game Room"
   */
  

};

gameServer.onModifyUserInfo = function(client, data){
  gameServer.players[client.uuid].color = data.color;
  gameServer.players[client.uuid].nickname = data.nickname;
  console.log("\t socket.io:: player:"+client.uuid+" modify info.", "color:", data.color, "nickname", data.nickname);
};

gameServer.onReady = function(client){
  gameServer.players[client.uuid].isReady = true;
  console.log("\t socket.io:: player:"+client.uuid+" is ready.");
};


gameServer.onJoinGame = function(client) {
  console.log("\t socket.io:: host "+client.uuid+" start game.");
  gameServer.host = client.uuid;
  gameServer.players[client.uuid].isReady = true;

  // Join all ready users in gameServer.games
  for(var uuid in gameServer.players){
    if(gameServer.players[uuid].isReady){
      gameServer.games[uuid] = gameServer.players[uuid];
      console.log("\t socket.io:: player:", uuid, "join game.");
      
      // join room & tell client start game
      gameServer.games[uuid].instance.join("Game Room");
    }
  }
  
  // broadcast join game players
  io.sockets.to("Game Room").emit('startGame');
  this.isPlaying = true;
  
  /**
   * broadcast all player info every syncIntervalTime
   */
  gameServer.syncInterval = setInterval(function(){
    var state = {};
    for(var uuid in gameServer.games){
      state[uuid]={
          pos:{
            x: gameServer.games[uuid].pos.x,
            y: gameServer.games[uuid].pos.y
          },
          direct: gameServer.games[uuid].direct,
          isDead: false, //TODO
      };
    }
    io.sockets.to("Game Room").emit('gamePlayerInfo', state);
  }, syncIntervalTime);
};

gameServer.onPlayerMoved = function(client, data) {
  if(gameServer.isPlaying){
    console.log("\t socket.io:: player:", client.uuid, "action:", data.direct);
    
    var o = gameServer.games[client.uuid];
    o.old_state.pos.x = o.pos.x;
    o.old_state.pos.y = o.pos.y;
    console.log("\t socket.io:: player:" , client.uuid,
        "old position ( x , y ) = ", "(",o.old_state.pos.x, ",",o.old_state.pos.y,")");
    
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

gameServer.onDisconnected = function(client) {
  console.log('\t socket.io:: client disconnected ' + client.uuid);
  delete this.players[client.uuid];
  if(gameServer.isPlaying){
    delete gameServer.games[client.uuid];
  }
};