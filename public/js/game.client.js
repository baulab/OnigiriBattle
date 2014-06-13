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
    socket.on('disconnected', function() {
      console.log("disconnect player: " + game.getClientUUID());
    });
    $('#test_movie_right').click(function(){
      socket.emit('playermoved', {msg: 'move right'});
    });
    
    $('#test_movie_left').click(function(){
      socket.emit('playermoved', {msg: 'move left'});
    });
  },
  getClientUUID: function (){
    return this.clientUUID;
  },
  setClientUUID: function (uuid){
    this.clientUUID = uuid;
  }
};


