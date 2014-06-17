// DOM controller
var socket = io();
var player = new Object;
var info = {}; // All player info and status
$(document).ready(function() {
    

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
    
    
    // var player = new Object;
    // player.name = makeid();
    // player.color = 'red';
    
    // socket.emit('init player', player);
    
    socket.on('player joined', function(obj) {
        // Update host
        updateHost(obj);        
        
        // Notify new player joined
        //$('#players').append($('<li>').text(obj.newPlayer.name + ' joined'));
        $('#chattingRoom').text($('#chattingRoom').val() + obj.newPlayer.name + ' joined' + "\r\n");
    });
    
    socket.on('player left', function(obj) {
        // Update host
        updateHost(obj);
        
        //$('#players').append($('<li>').text(obj.exitPlayer.name + ' left'));
        $('#chattingRoom').text($('#chattingRoom').val() + obj.newPlayer.name + ' left' + "\r\n");
    })
    
    socket.on('update play status', function(obj) {
        // Update host
        updateHost(obj);
        
        // Update all player list
        // ....
    })    
    
    // socket.on('chat message', function(msg){
    //     $('#messages').append($('<li>').text(msg));
    // });
    
    function updateHost(obj) {
        // Update info
        info = obj;
        
        // Enable/Disable start button if player is host.
        if (player.name == info.chatroom.host) {
            // Update host
            $('#hostSpan').text(info.chatroom.host);
            //$('#start_btn_span').prop('disabled', false);
            $('#start_btn_span').show();
        } else {
            $('#hostSpan').text(info.chatroom.host);
            //$('#start_btn_span').prop('disabled', true);
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

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}