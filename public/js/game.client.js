var game = {

  establishConn: function(socket){
    socket.on('move', function (data) {
      console.log(data);
      socket.emit('my other event', { my: 'data' });
    });
    
    socket.on('onconnected', function(client){
      console.log("player: " + client.id);
      game.setClientUUID(client.id);
    });
    
    /**
     * start game response
     */
    socket.on('start game', function(chatroom){
      info = chatroom;
      swapTo('game_area');
      abc();
      initPlayers(chatroom.playerList);
    });
    
    // broadcast all player info
    socket.on('gamePlayerInfo', function(data){
      console.log(data.playerList);
      testUpdatePlayers(data.playerList);
    });
    
    
    socket.on('disconnected', function() {
      console.log("disconnect player: " + game.getClientUUID());
    });
    
    $('#test_movie_right').click(function(){
      socket.emit('playerMoved', {direct: 'right'});
      updateMove()
    });
    
    $('#test_movie_left').click(function(){
      socket.emit('playerMoved', {direct: 'left'});
      updateMove()
    });
    
    $('#test_movie_up').click(function(){
      socket.emit('playerMoved', {direct: 'up'});
    });
    
    $('#test_movie_down').click(function(){
      socket.emit('playerMoved', {direct: 'down'});
    });
    
    
    $('#test_ready').click(function(){
      socket.emit('ready');
    });
    
    $('#test_start').click(function(){
      socket.emit('joinGame');
    });
    
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


