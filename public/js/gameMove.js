/**
 * New node file
 */
var colors={};
function abc(){
	
		speed=1;
	
		selfX=2;
		selfY=3;
		selfId="ABC";
		color="#980000";
		
		
		var table=$('<table></table>').attr("border",1).attr("id","table_map");
		for(i=1;i<=12;i++){
			var row = $('<tr></tr>').height('30');
			for(j=1;j<=30;j++){
				var column=$('<td></td>').width('30');
				row.append(column);
			}
			table.append(row);
		}
		$('#base_table').append(table);
		
		createTriangle(selfId,selfX,selfY,color);
		
		window.addEventListener('keydown',doKeyDown,true);
		
	}
	
	function createTriangle(id,x,y,color){
		var td=$("#table_map").find("tr").eq(y).find("td").eq(x);
		td.append($("<div></div>").addClass("moveU").attr("id",id).css("border-bottom","15px solid "+color));
	}
	
	function doKeyDown(evt){
		switch (evt.keyCode) {
		case 38:  /* Up arrow was pressed */
		if(selfY==0){
			selfY=15;
		}else{
			selfY=selfY-1;
		}
		$("#table_map").find("tr").eq(selfY).find("td").eq(selfX).append($("#"+selfId));
		$("#"+selfId).removeClass().css({borderTop: "",borderBottom:"", borderLeft: "",borderRight:"" }).addClass("moveU").css("border-bottom","15px solid "+color);
		checkDiedU();
		break;
		
		case 40:  /* Down arrow was pressed */
		if(selfY==15){
			selfY=0;
		}else{
			selfY=selfY+1;
		}
		$("#table_map").find("tr").eq(selfY).find("td").eq(selfX).append($("#"+selfId));
		$("#"+selfId).removeClass().css({borderTop: "",borderBottom:"", borderLeft: "",borderRight:"" }).addClass("moveD").css("border-top","15px solid "+color);
		checkDiedD();
		break;
		
		case 39:  /* Right arrow was pressed */
		if(selfX==29){
			selfX=0;
		}else{
			selfX=selfX+1;
		}
		$("#table_map").find("tr").eq(selfY).find("td").eq(selfX).append($("#"+selfId));
		$("#"+selfId).removeClass().css({borderTop: "",borderBottom:"", borderLeft: "",borderRight:"" }).addClass("moveR").css("border-left","15px solid "+color);
		checkDiedR();
		
		
		break;
		case 37:  /* Left arrow was pressed */
		if(selfX==0){
			selfX=29;
		}else{
			selfX=selfX-1;
		}
		$("#table_map").find("tr").eq(selfY).find("td").eq(selfX).append($("#"+selfId));
		$("#"+selfId).removeClass().css({borderTop: "",borderBottom:"", borderLeft: "",borderRight:"" }).addClass("moveL").css("border-right","15px solid "+color);
		checkDiedL();
		break;
		}
	}
	
	function updateMove(name,x,y,direction){
		$("#table_map").find("tr").eq(y).find("td").eq(x).append($("#"+name));
		console.log(colors[name]);
		var obj=$("#"+name);
		obj.removeClass().css({borderTop: "", borderBottom:"", borderLeft: "", borderRight:"" });
		switch(direction){
			case "up":
			obj.addClass("moveU").css("border-bottom","15px solid "+colors[name]);
			break;
			case "down":
			obj.addClass("moveD").css("border-top","15px solid "+colors[name]);
			break;
			case "left":
			obj.addClass("moveL").css("border-right","15px solid "+colors[name]);
			break;
			case "right":
			obj.addClass("moveR").css("border-left","15px solid "+colors[name]);
			break;
		}
	}
	
	function checkDiedU(){
		
	}
	function checkDiedD(){
		
	}
	function checkDiedL(){
		
	}
	function checkDiedR(){
		
	}
	
	// init player
	function initPlayers(datails){
		//var details=$("#testObjs").val();
		//var jsonData = $.parseJSON(details);
		for (var i in datails) {
		  var player = datails[i];
			createTriangle(player.name,player.pos.x,player.pos.y,player.color);
			colors[player.name]=player.color;
		}
	}
	
	// update position
	function testUpdatePlayers(players){
		//var details=$("#testUpObjs").val();
		//var jsonData = $.parseJSON(details);
		for (var i in players) {
		  //var player=jsonData[i];
		  var player = players[i];
			updateMove(player.name, player.pos.x, player.pos.y, player.direct);
		}
	}