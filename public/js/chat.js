var shortly;
$(document).ready(function() {
    $("#sendMessage").click(function() {
    	socket.emit('chat message', $('#enterMessage').val());
        $('#enterMessage').val(''); 
	});

	$('#countdown').countdown({until: shortly, 
    onExpiry: liftOff});

	socket.on('chat message', function(msg){
        $('#chattingRoom').text($('#chattingRoom').val() + msg + "\r\n");
    });

    $("#join").click(function() {
    	socket.emit('update play status', true);
	});

	$("#escape").click(function() {
    	socket.emit('update play status', false);
	});

	$("#start_button").click(function() {
		shortly = new Date(); 
	    shortly.setSeconds(shortly.getSeconds() + 5.5);
	    $('#page1').hide();
	    $('#countdown').show();
	    $('#countdown').countdown('option', {until: shortly,format: 'S'}); 
	});
	
	function liftOff() {
		$('#countdown').hide();
	    alert('We have lift off!'); 
	}
});

