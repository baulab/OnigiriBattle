var game = {
  list:[],
  establishConn: function(socket){
      var li=this.list;
    socket.on('move', function (data) {
      console.log(data);
      socket.emit('my other event', { my: 'data' });
    });
    
    socket.on('onconnected', function(client){
      console.log("player: " + client.id);
      game.setClientUUID(client.id);
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
      abc(socket);
      initPlayers(chatroom.playerList);
    });
    
    // broadcast all player info
    socket.on('gamePlayerInfo', function(data){
      //console.log(data.playerList);
      if(li.length<1){
          li=data.playerList;
      }
      testUpdatePlayers(data.playerList);
    });
    
    socket.on('removePlayer', function(data){
        delete data.room.playerList[data.play];
    })
    
    $('#test_movie_right').unbind().click(function(){
      socket.emit('playerMoved', {direct: 'right'});
    }).hide();
    
    $('#test_movie_left').unbind().click(function(){
      socket.emit('playerMoved', {direct: 'left'});
    }).hide();
    
    $('#test_movie_up').unbind().click(function(){
      socket.emit('playerMoved', {direct: 'up'});
    }).hide();
    
    $('#test_movie_down').unbind().click(function(){
      socket.emit('playerMoved', {direct: 'down'});
    }).hide();
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