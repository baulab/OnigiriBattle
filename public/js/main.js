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
	        $('.room').css('color',player.color);
	        return false;
	    });
	
	    $("#start_button").unbind().click(function(){
	      $(".backClass").css('background-image', 'url(../images/Battle_Background.png)');
	      swapTo('game_area');
	    });
	    
        $('#send_message_btn').unbind().click(function(e) {
            socket.emit('chat message', $('#enterMessage').val());
            $('#enterMessage').val('');
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
        });
    	
    	socket.on('player joined', function(obj) {
            // Update host
            updateHost(obj);        
            
            // Notify new player joined
            $('#players').append($('<li>').text(obj.newPlayer.name + ' joined'));
        });
        
        socket.on('player left', function(obj) {
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
    }
    
    function updateHost(obj) {
        // Update info
        info = obj;
        
        // Enable/Disable start button if player is host.
        if (player.name == info.chatroom.host) {
            // Update host
            $('#host').text('host: ' + info.chatroom.host);
            $('#start').prop('disabled', false);
        } else {
            $('#host').text('host: ' + info.chatroom.host);
            $('#start').prop('disabled', true);
        }
        
        // All players checkbox is unchecked.
        if (!info.chatroom.host) {
            $('#host').text('host: all players not ready');
            $('#start').prop('disabled', true);            
        }
    }
});
