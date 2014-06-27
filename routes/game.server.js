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
      fn({isPlaying: that.isPlaying, players: that.chatroom.playerList});
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
    // console.log("\t socket.io:: player:", client.uuid, "action: attack");

    var o = this.games[client.uuid];
    var dead = [];
    // console.log("\t socket.io:: player:" , client.uuid,
    //      "position ( x , y ) = ", "(",o.pos.x, ",",o.pos.y,")");

    var x = o.pos.x;
    var y = o.pos.y;

    // 半徑, 最遠可攻擊距離
    var radius = Math.round(Math.sqrt(Math.pow(50, 2) * 2)) - 35; // 扣35, 原半徑攻擊範圍過廣

    for (var uuid in this.games) {
      var player = this.games[uuid];

      // 自己或死者，無法攻擊
      if (uuid == o.uuid || player.isDead) {
        continue;
      }

      // 以當前玩家中心坐標為圓心 (0, 0), y-axis 反轉，上正，下負 (Canvas y-axis，上負，下正)
      var adjustX = player.pos.x - x;
      var adjustY = y - player.pos.y; // y-axis 反轉

      // 敵人與當前玩家中心點距離
      var distance = Math.round(Math.sqrt(Math.pow(adjustX, 2) + Math.pow(adjustY, 2)));      

      var up_right_radians, 
          up_left_radians,
          down_right_radians,
          down_left_radians;

      // 敵人所在坐標的弧度
      var enemyRadians = Math.atan2(adjustY, adjustX);
      // 是否在扇形可視角內
      var isSeeing = false;

      // 扇形攻擊範圍，角度設為90度
      switch (o.direct) {
      case 'up':
        up_right_radians = Math.atan2(25, 25);
        up_left_radians = Math.atan2(25, -25);
        if (enemyRadians > up_right_radians && enemyRadians < up_left_radians) {
          isSeeing = true;
        }
        break;
      case 'down':
        down_right_radians = Math.atan2(-25, 25);
        down_left_radians = Math.atan2(-25, -25);
        if (enemyRadians < down_right_radians && enemyRadians > down_left_radians) {
          isSeeing = true;
        }        
        break;
      case 'left':
        up_left_radians = Math.atan2(25, -25);
        down_left_radians = Math.atan2(-25, -25);
        if (enemyRadians > up_left_radians || enemyRadians < down_left_radians) {
          isSeeing = true;
        }          
        break;
      case 'right':
        up_right_radians = Math.atan2(25, 25);
        down_right_radians = Math.atan2(-25, 25);
        if (enemyRadians < up_right_radians && enemyRadians > down_right_radians) {
          isSeeing = true;
        }          
        break;
      }

      if (isSeeing && distance <= radius) {
        // console.log("\t socket.io:: attacked player:" , player.uuid,
        //    "position ( x , y ) = ", "(",player.pos.x, ",",player.pos.y,") is dead");
        player.isDead = true;
        dead.push(player);
        deadCount++;
      };
    }

    if (dead.length > 0) {
      io.emit('update players', {players: this.chatroom.playerList, attacker: o, dead: dead});
    }

    this.checkGameOver();
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
    io.sockets.emit('gameOverAndWinnerInfo', this.winner);
  }
};

gameServer.prototype.setChatroom = function(chatroom){
  this.chatroom = chatroom;
}
gameServer.prototype.playerOut = function(player){
    io.sockets.emit('removePlayer', {room:this.chatroom, play:player});
}
