var game = {
  /**
   * client uuid
   */
  userid : "",
  
  establishConn: function(){
    var socket = io.connect('http://localhost:3000');
    socket.on('move', function (data) {
      console.log(data);
      socket.emit('my other event', { my: 'data' });
    });
    
    socket.on('onconnected', function(client){
      console.log("player: " + client.id);
      game.setClientUUID(client.id);
    });
    
    socket.on('startGame', function(){
      console.log('start');
    });
    
    socket.on('gamePlayerInfo', function(data){
      console.log(data);
    });
    
    
    socket.on('disconnected', function() {
      console.log("disconnect player: " + game.getClientUUID());
    });
    
    $('#test_movie_right').click(function(){
      socket.emit('playerMoved', {direct: 'right'});
    });
    
    $('#test_movie_left').click(function(){
      socket.emit('playerMoved', {direct: 'left'});
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

