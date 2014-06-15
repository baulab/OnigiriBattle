// DOM controller
$(document).ready(function() {
    var socket = io();

    $('form').submit(function(e) {
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });
    
    $('#isReady').on('change', function() {
        socket.emit('update play status', $(this).is(':checked'));
    });
    
    $('#start').click(function() {
       $(this).prop('disabled', true);
    });
    
    var info = {}; // All player info and status
    var player = new Object;
    player.name = makeid();
    player.color = 'red';
    
    socket.emit('init player', player);
    
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
    })
    
    socket.on('update play status', function(obj) {
        // Update host
        updateHost(obj);
        
        // Update all player list
        // ....
    })    
    
    socket.on('chat message', function(msg){
        $('#messages').append($('<li>').text(msg));
    });
    
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

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}