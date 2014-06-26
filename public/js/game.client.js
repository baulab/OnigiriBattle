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
      
      console.log(data);
      
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
    });
    
    function doKeyDown(event) {
        if (game.directions.hasOwnProperty(event.keyCode)) {
          var direction = game.directions[event.keyCode];
          if (direction === 'attack') {
            game.socket.emit('playerAttack');
          } else {
            game.socket.emit('playerMoved', {direct: direction});
          }
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
              ctx.fillStyle = player.color;
              ctx.beginPath();
              this.drawMoving(ctx, x, y, player.direct, player.color);
              ctx.fill();
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
        
        switch(direction) {
        case 'left': //left
            // ctx.moveTo(x, y);
            // ctx.lineTo(x, y-offset);
            // ctx.lineTo(x-offset, y);
            // ctx.lineTo(x, y+offset);
            ctx.drawImage(image, characterColorX*100, characterColorY*400+100, 50, 50, originX, originY, offset, offset);
            break;
        case 'up': //up
            // ctx.moveTo(x, y);
            // ctx.lineTo(x-offset, y);
            // ctx.lineTo(x, y-offset);
            // ctx.lineTo(x+offset, y);
            ctx.drawImage(image, characterColorX*100, characterColorY*400+300, 50, 50, originX, originY, offset, offset);
            break;
        case 'right': //right
            // ctx.moveTo(x, y);
            // ctx.lineTo(x, y-offset);
            // ctx.lineTo(x+offset, y);
            // ctx.lineTo(x, y+offset);
            ctx.drawImage(image, characterColorX*100, characterColorY*400+200, 50, 50, originX, originY, offset, offset);
            break;
        case 'down': //down
            // ctx.moveTo(x, y);
            // ctx.lineTo(x+offset, y);
            // ctx.lineTo(x, y+offset);
            // ctx.lineTo(x-offset, y);
            ctx.drawImage(image, characterColorX*100, characterColorY*400, 50, 50, originX, originY, offset, offset);
            break;
        default: // init
            ctx.drawImage(image, point.x, point.y, 50, 50, originX, originY, offset, offset);
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
