// DOM controller
$(document).ready(function() {
	$("#loginInfoSubmit").click(function(){
		$(".backClass").css('background-image', 'url(../images/Chatting_Background.png)');
		$("#page0").hide();
		$("#page1").show();
	});
	
   $("#start_button").click(function(){
	  $(".backClass").css('background-image', 'url(../images/Battle_Background.png)');
	  $("#page1").hide();
	  $("#page2").show();
   });
});