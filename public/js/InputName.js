$(document).ready(function() {
    $("#loginInfoSubmit").click(function() {
		var userName = $('#username').val();
		if(userName=="" || typeof(userName) === "undefined"){
			alert('請輸入姓名');
		}else{
			var character = $('#character').val();
			
			
		    player.name = userName;
		    player.color = character;
		    
		    socket.emit('init player', player);

			alert('歡迎' + userName + '加入遊戲!');

			$("#nameSpan").html(userName);
			$("#colorSpan").html(character);
			$('#page0').hide();
			$('#page1').show();

		}
	});

	
});

