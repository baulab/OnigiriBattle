var game = {
  list:[],
  directions: {32: 'attack', 37: 'left', 38: 'up', 39: 'right', 40: 'down'},
  socket: {},

  establishConn: function(socket){
    game.socket = socket;
    
    socket.on('onconnected', function(client){
      console.log("player: " + client.uuid);
      game.setClientUUID(client.uuid);
    });
    
    
    //broadcast game over and winner info
    socket.on('gameOverAndWinnerInfo', function(data){
      
      console.log("gameOverAndWinnerInfo", data);
      
      // end game, unbind keypress event
      window.removeEventListener("keypressed", doKeyDown, false);
      
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
      //$('#battleChattingMessage').scrollTop($('#battleChattingMessage').scrollHeight);

      // Control player
      window.removeEventListener("keypressed", doKeyDown, false);
      window.addEventListener("keypressed", doKeyDown, false);

      $(document).off("keydown").on('keydown', function(event) {
        if (event.keyCode == 32) {
          game.socket.emit('playerAttack');
        };
      });
      
      // if someone is at index page, would not change to game_area
      if(!$('#index').is(':visible')){
          $(".backClass").css('background-image', 'url(../images/Battle_Background.png)');
          swapTo('game_area');
          game.initPlayer(chatroom.playerList);
          console.log("\t on start game", game.getClientUUID());
      }
      
      $('#battleChattingMessage').scrollTop(999999);

    });
    
    socket.on('removePlayer', function(data){
        delete data.room.playerList[data.play];
    });

    socket.on('update players', function(data){
      drawing.drawPlayers(data.players);

      // Some players are dead
      if (data.hasOwnProperty('attacker') && data.hasOwnProperty('dead')) {
        for (var i = 0; i < data.dead.length; i++) {
          var aDead = data.dead[i];
          var message = 'I killed ' + aDead.name;
          if (data.attacker.uuid == game.getClientUUID()) {
            game.socket.emit('chat message', message);
          }
        }        
      }
    });
    
    /**
     * when no body is in game (not finish), let observer change to chatroom
     */
    socket.on('remove observer', function(data){
        swapTo('chatroom');
        socket.emit('chat message', 'Welcome back to room~');
        $(".backClass").css('background-image', 'url(../images/Chatting_Background.png)');  
    });
    
    function doKeyDown(event) {
        if (game.directions.hasOwnProperty(event.keyCode)) {
          var direction = game.directions[event.keyCode];
          game.socket.emit('playerMoved', {direct: direction});
        }
    }
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


// Draw by cavans
var drawing = {
    drawMap: function() {
        
    },
    
    drawPlayers: function(players) {
        var canvas = document.getElementById('map');
        if (canvas.getContext){
          var ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, 400, 400);
          
          ctx.save();
          for (var i = 0; i < players.length; i++) {
              var player = players[i];
              var x = player.pos.x;
              var y = player.pos.y;

              if (player.isDead) {
                // draw dead

              } else {
                this.drawMoving(ctx, x, y, player.direct, player.color);
              }
          }
          ctx.restore();
        }
    },
    
    drawMoving: function(ctx, x, y, direction, color) {
        var offset = 50; // size unit of Onigiri 
        var originX = x - (offset / 2);
        var originY = y - (offset / 2);
        
        // Get origiri sprites
        var image = document.getElementById('origiri-images');
        // Get current origin in sprites 
        var point = drawing.getPointByOnigiriColor(color);        
        
        switch(direction) {
        case 'left': //left
            ctx.drawImage(image, point.x, point.y+100, offset, offset, originX, originY, offset, offset);
            break;
        case 'up': //up
            ctx.drawImage(image, point.x, point.y+300, offset, offset, originX, originY, offset, offset);
            break;
        case 'right': //right
            ctx.drawImage(image, point.x, point.y+200, offset, offset, originX, originY, offset, offset);
            break;
        case 'down': //down
            ctx.drawImage(image, point.x, point.y, offset, offset, originX, originY, offset, offset);
            break;
        default: // init
            ctx.drawImage(image, point.x, point.y, offset, offset, originX, originY, offset, offset);
        }
    },
    
    getPointByOnigiriColor: function (color) {
        var characterColorX = 0;
        var characterColorY = 0;
        if(color=='black'){
            characterColorY = 0;
            characterColorX = 0;           
        }else if(color=='blue'){
            characterColorY = 1;
            characterColorX = 0;            
        }else if(color=='green'){
            characterColorY = 2;
            characterColorX = 0;            
        }else if(color=='orange'){
            characterColorY = 3;
            characterColorX = 0;
        }else if(color=='pink'){
            characterColorY = 4;
            characterColorX = 0;
        }else if(color=='purple'){
            characterColorY = 0;
            characterColorX = 1;
        }else if(color=='red'){
            characterColorY = 1;
            characterColorX = 1;
        }else if(color=='yellow'){
            characterColorY = 2;
            characterColorX = 1;
        }           
        
        return {x: characterColorX * 100, y: characterColorY * 400};
    }
};
