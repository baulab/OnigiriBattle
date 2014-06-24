var game = {
  list:[],
  establishConn: function(socket){
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
      battlefield.drawPlayers(playerList);
  }  
};

function swapTo(id) {
  $('#' + id).show();
  $('#' + id).siblings().hide();
}

var battlefield = {
    drawMap: function() {
        
    },
    
    drawPlayers: function(players) {
        var canvas = document.getElementById('map');
        if (canvas.getContext){
          var ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, 600, 300);
          
          ctx.save();
          var offset = 8;
          for (var i = 0; i < players.length; i++) {
              var player = players[i];
              var x = player.pos.x;
              var y = player.pos.y;
              ctx.fillStyle = player.color;
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x, y-offset);
              ctx.lineTo(x+offset, y);
              ctx.lineTo(x, y+offset);
              ctx.fill();   
          }
          ctx.restore();
        }
    }
}
