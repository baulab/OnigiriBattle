var game = {
  player: {},
  colors: {},

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
      $(".backClass").css('background-image', 'url(../images/Battle_Background.png)');
      swapTo('game_area');
      game.drawBattleField();
      game.createPlayers(chatroom.playerList);
    });
    
    // broadcast all player info
    socket.on('gamePlayerInfo', function(data){
      console.log(data.playerList);
      game.updatePlayer(data.playerList);
    });

    $(window).on('keydown', function(event) {
      switch(event.keyCode) {
        case 37: // left
        socket.emit('playerMoved', {direct: 'left'});
        break;
        case 38: // up
        socket.emit('playerMoved', {direct: 'up'});
        break;
        case 39: // right
        socket.emit('playerMoved', {direct: 'right'});  
        break;
        case 40: // down
        socket.emit('playerMoved', {direct: 'down'});
        break;
        default:
      }

      updateMove()
    });
    
  },
  getClientUUID: function (){
    return game.clientUUID;
  },
  setClientUUID: function (uuid){
    game.clientUUID = uuid;
  },

  createPlayers: function(details) {
    for ( var i in datails) {
        var playerObj = datails[i];
        game.createTriangle(playerObj.name, playerObj.pos.x, playerObj.pos.y, playerObj.color);
        colors[playerObj.name] = playerObj.color;
        if(player.name = playerObj.name){
            thisPlayer = playerObj;
        }
    }
  },

  createTriangle: function(id, x, y, color) {
    var td = $("#table_map").find("tr").eq(y).find("td").eq(x);
    td.append($("<div></div>").addClass("moveU").attr("id", id).css("border-bottom", "15px solid " + color));
  }

  drawBattleField: function() {
    var table = $('<table></table>').attr("border", 1).attr("id", "table_map");
    for (i = 1; i <= 12; i++) {
        var row = $('<tr></tr>').height('30');
        for (j = 1; j <= 30; j++) {
            var column = $('<td></td>').width('30');
            row.append(column);
        }
        table.append(row);
    }
    $('#base_table').append(table);
  },

  intoBattle: function() {
    for ( var i in datails) {
        var playerObj = datails[i];
        createTriangle(playerObj.name, playerObj.pos.x, playerObj.pos.y, playerObj.color);
        colors[playerObj.name] = playerObj.color;
        if(player.name = playerObj.name){
            game.player = playerObj;
        }
    }
  },

  updatePlayer: function(players) {
    for ( var i in players) {
        //var player=jsonData[i];
        var player = players[i];
        game.updateMove(player.name, player.pos.x, player.pos.y, player.direct);
    }
  },

  updateMove: function(name, x, y, direction) {
    $("#table_map").find("tr").eq(y).find("td").eq(x).append($("#" + name));

    var obj = $("#" + name);
    obj.removeClass().css({
        borderTop : "",
        borderBottom : "",
        borderLeft : "",
        borderRight : ""
    });
    switch (direction) {
    case "up":
        obj.addClass("moveU").css("border-bottom", "15px solid " + colors[name]);
        break;
    case "down":
        obj.addClass("moveD").css("border-top", "15px solid " + colors[name]);
        break;
    case "left":
        obj.addClass("moveL").css("border-right", "15px solid " + colors[name]);
        break;
    case "right":
        obj.addClass("moveR").css("border-left", "15px solid " + colors[name]);
        break;
    }
  }

};

function swapTo(id) {
  $('#' + id).show();
  $('#' + id).siblings().hide();
}


