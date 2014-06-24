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
    
    
    //broadcast game over and winner info
    socket.on('gameOverAndWinnerInfo', function(data){
      console.log(data);
      $(".backClass").css('background-image', 'url(../images/winner_background.png)');
      swapTo('result_area');
      $("#show_result").text(data.name);
      $("#show_result").css("color", data.color);
    });
    
    /**
     * start game response
     */
    socket.on('start game', function(chatroom){
      info = chatroom;
      $(".backClass").css('background-image', 'url(../images/Battle_Background.png)');
      swapTo('game_area');
      abc(socket);
      console.log("\t on start game", game.getClientUUID());
      initPlayers(chatroom.playerList, game.getClientUUID());
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
    })
    
  },
  getClientUUID: function (){
    return this.clientUUID;
  },
  setClientUUID: function (uuid){
    this.clientUUID = uuid;
  }
};

function swapTo(id) {
  $('#' + id).show();
  $('#' + id).siblings().hide();
}