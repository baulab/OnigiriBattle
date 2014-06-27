function swapTo(id) {
  $('#' + id).show();
  $('#' + id).siblings().hide();
}

// DOM controller
$(document).ready(function() {

  var socket = io();
  var info = {}; // All player info and status
  var player = new Object;
  var playerList = new Object;
  init();
  function init() {
    initColor();
    swapTo('index');
    events();
    conn();
    $('#friendsList, #fightList').attr('readonly', 'readonly');
  }

  function initColor(){
      socket.emit('color list');
      socket.on('update color', function(obj) {
          console.log(obj);
          var list = obj.clr;
          for(var i in list){
              $('#color option[value="'+list[i]+'"]').remove();
          }
          if($('#color option').length<1){
              if(!player.name){
                  alert('Game is full~ Please try to refresh later...');
                  $('#loginInfoSubmit').remove();
              }
          }
      });
  }
  
  function events() {
    $("#loginInfoSubmit").unbind().click(function() {
        
      player.name = $('#username').val();
      player.color = $('#color').val();
      socket.emit('init player', player);
      $('.room').css('color', player.color);
      $('#nameSpan').html(player.name);
      $('#colorSpan').html(player.color);

      socket.emit('check game playing', null, function(data){
          if(!data.isPlaying){
              $(".backClass").css('background-image', 'url(../images/Chatting_Background.png)');
              swapTo('chatroom');
          }else{
              $(".backClass").css('background-image', 'url(../images/Battle_Background.png)');
              swapTo('game_area');
              drawing.drawPlayers(data.players);
          }
      });
      
      return false;
    });
    
    /**
     * game start button event
     */
    $("#start_button").unbind().click(function() {
      socket.emit('init game'); //?
    });

    $('#send_message_btn').unbind().click(function(e) {
        sendMsg('enterMessage');
        return false;
    });
    
    /**
     * player is ready for game event
     */
    $('#isReady').on('change', function() {
      socket.emit('update play status', $(this).is(':checked'));
    });
    
    $('#start').unbind().click(function() {
      $(this).prop('disabled', true);
    });
    
    $('#to_win').unbind('click').click(function() {
      swapTo('result_area');
      socket.emit('finish',{win:true});
    }).hide();
    
    $('#to_lose').unbind('click').click(function() {
        swapTo('result_area');
        socket.emit('finish',{win:false});
    }).hide();

    $('#restart').unbind().click(function() {
      swapTo('chatroom');
      socket.emit('chat message', 'Welcome back to room~');
      $(".backClass").css('background-image', 'url(../images/Chatting_Background.png)');      
    });
    
    $("#join").click(function() {
      socket.emit('update play status', true);
    });
    
    $("#escape_btn").click(function() {
      socket.emit('update play status', false);
    });

    $('#enterMessage').keypress(function(event){
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == '13'){
            $('#send_message_btn').click();
            return false;
        }
    });

    $('#send_battle_message_btn').unbind().click(function(e) {
      sendMsg('enterBattleChattingMessage');
      return false;
    });

    $('#enterBattleChattingMessage').keypress(function(event){
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == '13'){
          $('#send_battle_message_btn').click();
            return false;
        }
    });
    
    function sendMsg(id){
        var message = $('#'+id).val().trim();
        if(message.length>0){
            if(message.indexOf('@') == 0 && message.split(' ').length>1){
                message = directTxt(message);
            }
            sendMessage(message);
            $('#'+id).val('');
        }
    }
    
    function directTxt(msg){
        var arr = msg.split(' ');
        var to  = arr.shift();
        msg = player.name + '->' + to.substring(1, to.length) + ': ' + arr.join(' ');
        return msg;
    }
  }
  function conn() {
    socket.on('update play status', function(obj) {
      // Update host
      playerList = obj;
      updateHost(obj);

      // Update all player list
      // ....
    })

    socket.on('chat message', function(msg) {
      var li = $('<li>');
      li.css('color', msg.from.color);
      li.text(msg.msg);
      $('.disp_messages').append(li);
      var cont = $('.disp_messages').parent();
      for( var obj in cont){
          $(cont).scrollTop($(cont)[0].scrollHeight);
      }

      $('#battleChattingMessage').scrollTop(999999);
    });

    socket.on('player joined', function(obj) {
      // Update host
      playerList = obj;
      updateHost(obj);        
      console.log(obj);
      // Notify new player joined
      var li=$('<li>');
      li.css('color',obj.newPlayer.color);
      li.text(obj.newPlayer.name + ' joined');
      $('#messages').append(li);
      $('#battleChattingMessage').append(li.clone());
    });

    socket.on('player left', function(obj) {
      console.log('player left');
      console.log(obj);
      // Update host
      updateHost(obj);
      playerList = obj;
      
      var li=$('<li>');
      li.css('color',obj.exitPlayer.color);
      li.text(obj.exitPlayer.name + ' left');
      $('#messages').append(li);
      $('#battleChattingMessage').append(li.clone());
    });

    socket.on('game finish', function(obj){
        console.log(obj);
        if(obj.updatePlayer.uuid==player.uuid){
            $('window').unbind('keydown');
            if(obj.msg.win){
                $('#result_msg').text('You Won!!!');
            }else{
                $('#result_msg').text('You Lost~~');
            }
            $('#result_time').text(new Date()); 
        }
    });
    
    game.establishConn(socket);
  }

  function updateHost(obj) {
      // Update info
      info = obj;
      
      // Enable/Disable start button if player is host.
      if (player.name == info.chatroom.host) {
          // Update host
          $('#hostSpan').text(info.chatroom.host);
          //$('#start_btn_span').prop('disabled', false);
          $('#start_btn_td').show();
      } else {
          $('#hostSpan').text(info.chatroom.host);
          //$('#start_btn_span').prop('disabled', true);
          $('#start_btn_td').hide();
      }
      
      // All players checkbox is unchecked.
      if (info.chatroom.host==null) {
          $('#hostSpan').text('');
          //$('#start_btn_span').prop('disabled', true);
          $('#start_btn_td').hide();
      }
      
      //update List
      updatePlayList(obj);
  }
    
  function updatePlayList(obj){
      console.log(obj);
      $('#friendsList').val('');
      $('#fightList').val('');
      var playerList = obj.chatroom.playerList;
      var fightList = "";
      var friendsList = "";
      clearBattleList();
      for(var i in playerList){
          if(playerList[i].isPlay){
              fightList += playerList[i].name + "\r\n";
              updateBattleList(playerList[i].name,playerList[i].color,'join');
          }else{
              friendsList += playerList[i].name + "\r\n";
          }
      }
      $('#fightList').val(fightList);
      $('#friendsList').val(friendsList);
      
  }

  function sendMessage(value){
    if(value!=null && value !="" && typeof(value) !=="undefined"){
        socket.emit('chat message', value);
    }
  }

  /**
  if dead, please call updateBattleList(name,color,'dead')
  */
  function updateBattleList(name,color,status){
    var battlePlayerList = $('#battlePlayerList');
    if(status=='join'){
      var li = "<li id='battleList_" + name + "' style='color:" + color + "'>" + name + "</li>" ;
      //var li = $('<li></li>').val(name);
      battlePlayerList.append(li);
    }else if(status=='left'){
      battlePlayerList.find('#battleList_' + name).remove();
    }else if(status=='dead'){
      battlePlayerList.find('#battleList_' + name).css('text-decoration','line-through');
    }
  }

  function clearBattleList(){
    $('#battlePlayerList').find('li').remove();
  }

  window.updateBattleList = updateBattleList;
  window.playerList = playerList;
});