// DOM controller
$(document).ready(function() {
    var socket = io();
    var info = {}; // All player info and status
    var player = new Object;
    init();
    function init(){
    	swapTo('index');
    	events();
    	conn();
    }
    function swapTo(id){
    	$('#'+id).show();
    	$('#'+id).siblings().hide();
    }
    function events(){
        $("#loginInfoSubmit").unbind().click(function(){
	    	$(".backClass").css('background-image', 'url(../images/Chatting_Background.png)');
	    	swapTo('chatroom');
	
	        player.name = $('#username').val();
	        player.color = $('#color').val();
	        socket.emit('init player', player);
	        $('.lroom').css('color',player.color);
	        $('#nameSpan').html(player.name);
            $('#colorSpan').html(player.color);
	        return false;
	    });
	
	    $("#start_button").unbind().click(function(){
	      $(".backClass").css('background-image', 'url(../images/Battle_Background.png)');
	      socket.emit('init game');
	      swapTo('game_area');
	      abc();
	    });
	    var keyAlt=false;
	    $('#enterMessage').unbind('keydown').keydown(function(e){
	    	if(e.keyCode==18){
	    		keyAlt=true;
	    	}
	    });
	    $('#enterMessage').unbind('keyup').keyup(function(e){
	    	if(e.keyCode==18){
	    		keyAlt=false;
	    	}
	    	if(e.keyCode==13){
	    		if(keyAlt==true){
	    			$('#send_message_btn').click();
	    			return false;
	    		}
	    	}
	    });
	    
        $('#send_message_btn').unbind().click(function(e) {
        	var msg=$('#enterMessage').val().trim();
        	if(msg.length>0){
                socket.emit('chat message', $('#enterMessage').val());
                $('#enterMessage').val('');
        	}
            return false;
        });
        
        $('#isReady').on('change', function() {
            socket.emit('update play status', $(this).is(':checked'));
        });
        
        $('#start').unbind().click(function() {
           $(this).prop('disabled', true);
        });
        
        $('#to_win').unbind().click(function(){
        	swapTo('result_area');
        	socket.emit('finish',{win:true});
        });
        
        $('#to_win').unbind().click(function(){
        	swapTo('result_area');
        	socket.emit('game finish',{win:true});
        });
        
        $('#restart').unbind().click(function(){
        	swapTo('chatroom');
        	socket.emit('chat message','Welcome back to room~');
        });
        
        $("#join").click(function() {
         socket.emit('update play status', true);
        });

        $("#escape_btn").click(function() {
         socket.emit('update play status', false);
        });
    }
    function conn(){
    	socket.on('update play status', function(obj) {
            // Update host
            updateHost(obj);
            
            // Update all player list
            // ....
        })    
        
        socket.on('chat message', function(msg){
        	var li=$('<li>');
        	li.css('color',msg.from.color);
        	li.text(msg.msg);
            $('#messages').append(li);
            $('#chattingRoom').scrollTop($("#chattingRoom")[0].scrollHeight);;
        });
    	
    	socket.on('player joined', function(obj) {
            // Update host
            updateHost(obj);        
            console.log(obj);
            // Notify new player joined
            var li=$('<li>');
            li.css('color',obj.newPlayer.color);
            li.text(obj.newPlayer.name + ' joined');
            $('#messages').append(li);
        });
        
        socket.on('player left', function(obj) {
            console.log('player left');
            console.log(obj);
            // Update host
            updateHost(obj);
            
            $('#players').append($('<li>').text(obj.exitPlayer.name + ' left'));
        });
        
        socket.on('game finish', function(obj){
        	console.log(obj);
        	if(obj.updatePlayer.uuid==player.uuid){
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
            $('#host').text('host: ' + info.chatroom.host);
            $('#start_btn_span').show();
        } else {
            $('#host').text('host: ' + info.chatroom.host);
            $('#start_btn_span').hide();
        }
        
        // All players checkbox is unchecked.
        if (info.chatroom.host==null) {
            $('#hostSpan').text('');
            //$('#start_btn_span').prop('disabled', true);            
            $('#start_btn_span').hide();
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
      for(var i in playerList){
          if(playerList[i].isPlay){
              fightList += playerList[i].name + "\r\n";
          }else{
              friendsList += playerList[i].name + "\r\n";
          }
      }
      $('#fightList').val(fightList);
      $('#friendsList').val(friendsList);
      
  }

});
