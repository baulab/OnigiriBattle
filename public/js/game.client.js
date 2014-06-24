var game = {
  list:[],
  directions: {37: 'left', 38: 'up', 39: 'right', 40: 'down'},
  socket: {},
  establishConn: function(socket){
      this.socket = socket;
      var li=this.list;
    socket.on('move', function (data) {
      console.log(data);
      socket.emit('my other event', { my: 'data' });
    });
    
    socket.on('onconnected', function(client){
      console.log("player: " + client.uuid);
      game.setClientUUID(client.uuid);
    });
    
    $('#test_attack').click(function(){
      socket.emit('playerAttack');
    });
    
    //broadcast game over and winner info
    socket.on('gameOverAndWinnerInfo', function(data){
      console.log(data);
      $(".backClass").css('background-image', 'url(../images/winner_background.png)');
      swapTo('result_area');
      $("#result_msg").text("winner: " + data.name);
    });
    
    /**
     * start game response
     */
    socket.on('start game', function(chatroom){
      info = chatroom;
      $(window).on('keydown', function(event) {
          if (game.directions.hasOwnProperty(event.keyCode)) {
              drawing.drawPlayers(info.playerList, game.directions[event.keyCode]);
          }
      });
//      $(window).on('keyup', game.stop(event));
      
      $(".backClass").css('background-image', 'url(../images/Battle_Background.png)');
      swapTo('game_area');
//      abc(socket);
      game.initPlayer(chatroom.playerList);
      console.log("\t on start game", game.getClientUUID());
//      initPlayers(chatroom.playerList, game.getClientUUID());
    });
    
    // broadcast all player info
    socket.on('gamePlayerInfo', function(data){
      //console.log(data.playerList);
      if(li.length<1){
          li=data.playerList;
      }
      updatePlayersPos(data.playerList);
    });
    
    socket.on('removePlayer', function(data){
        delete data.room.playerList[data.play];
    });
    
  },
  
  getClientUUID: function (){
    return this.clientUUID;
  },
  setClientUUID: function (uuid){
    this.clientUUID = uuid;
  },
  
  initPlayer: function(playerList) {
      // Draw players
      drawing.drawPlayers(playerList);
  }
  
};

function swapTo(id) {
  $('#' + id).show();
  $('#' + id).siblings().hide();
}

var drawing = {
    drawMap: function() {
        
    },
    
    drawPlayers: function(players, direction) {
        var canvas = document.getElementById('map');
        if (canvas.getContext){
          var ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, 600, 300);
          
          ctx.save();
          for (var i = 0; i < players.length; i++) {
              var player = players[i];
              var x = player.pos.x;
              var y = player.pos.y;
              ctx.fillStyle = player.color;
              ctx.beginPath();
              this.drawDirection(ctx, x, y, direction);
              ctx.fill();
          }
          ctx.restore();
        }
    },
    
    drawDirection: function(ctx, x, y, direction) {
        var aStep = 8;  // pixels per step
        var offset = 8; // size unit of Onigiri 
        switch(direction) {
        case 'left': //left
            ctx.moveTo(x-aStep, y);
            ctx.lineTo(x-aStep, y-offset);
            ctx.lineTo(x-aStep-offset, y);
            ctx.lineTo(x-aStep, y+offset);
            break;
        case 'up': //up
            ctx.moveTo(x, y-aStep);
            ctx.lineTo(x-offset, y-aStep);
            ctx.lineTo(x, y-offset-aStep);
            ctx.lineTo(x+offset, y-aStep);
            break;
        case 'right': //right
            ctx.moveTo(x+aStep, y);
            ctx.lineTo(x+aStep, y-offset);
            ctx.lineTo(x+offset+aStep, y);
            ctx.lineTo(x+aStep, y+offset);
            break;
        case 'down': //down
            ctx.moveTo(x, y+aStep);
            ctx.lineTo(x+offset, y+aStep);
            ctx.lineTo(x, y+offset+aStep);
            ctx.lineTo(x-offset, y+aStep);
            break;
        default:
            // init
            ctx.moveTo(x+offset, y);
            ctx.lineTo(x, y+offset);
            ctx.lineTo(x-offset, y);
            ctx.lineTo(x, y-offset);
        }
    }
}
