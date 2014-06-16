// DOM controller
$(document).ready(function() {
    var socket = io();
    var info = {}; // All player info and status
    var player = new Object;

    $("#loginInfoSubmit").click(function(){
    	$(".backClass").css('background-image', 'url(../images/Chatting_Background.png)');
    	$("#page0").hide();
    	$("#page1").show();

        player.name = $('#username').val();
        player.color = $('#color').val()
        socket.emit('init player', player);
    });

    $("#start_button").click(function(){
      $(".backClass").css('background-image', 'url(../images/Battle_Background.png)');
      $("#page1").hide();
      $("#page2").show();
    });

    // $('form').submit(function(e) {
    //     socket.emit('chat message', $('#m').val());
    //     $('#m').val('');
    //     return false;
    // });
    
    // $('#isReady').on('change', function() {
    //     socket.emit('update play status', $(this).is(':checked'));
    // });
    
    // $('#start').click(function() {
    //    $(this).prop('disabled', true);
    // });
    
    // socket.on('player joined', function(obj) {
    //     // Update host
    //     updateHost(obj);        
        
    //     // Notify new player joined
    //     $('#players').append($('<li>').text(obj.newPlayer.name + ' joined'));
    // });
    
    // socket.on('player left', function(obj) {
    //     // Update host
    //     updateHost(obj);
        
    //     $('#players').append($('<li>').text(obj.exitPlayer.name + ' left'));
    // })
    
    // socket.on('update play status', function(obj) {
    //     // Update host
    //     updateHost(obj);
        
    //     // Update all player list
    //     // ....
    // })    
    
    // socket.on('chat message', function(msg){
    //     $('#messages').append($('<li>').text(msg));
    // });
    
    // function updateHost(obj) {
    //     // Update info
    //     info = obj;
        
    //     // Enable/Disable start button if player is host.
    //     if (player.name == info.chatroom.host) {
    //         // Update host
    //         $('#host').text('host: ' + info.chatroom.host);
    //         $('#start').prop('disabled', false);
    //     } else {
    //         $('#host').text('host: ' + info.chatroom.host);
    //         $('#start').prop('disabled', true);
    //     }
        
    //     // All players checkbox is unchecked.
    //     if (!info.chatroom.host) {
    //         $('#host').text('host: all players not ready');
    //         $('#start').prop('disabled', true);            
    //     }
    // }
});
