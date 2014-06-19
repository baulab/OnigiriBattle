(function(){
    /**
     * New node file
     */
    var colors = {};
    var thisPlayer = {};
    var playerList = [];
    var _socket = {};
    function abc(socket) {
        console.log(socket);
        _socket=socket;
        speed = 1;
        
        /**
         * test point
         *
        
         * selfX=2; 
         * selfY=3; 
         * selfId="ABC"; 
         * color="#980000";
         */

        var table = $('<table></table>').attr("id", "table_map").attr('class','battleTable');
        for (i = 1; i <= 12; i++) {
            var row = $('<tr></tr>').height('40');
            for (j = 1; j <= 30; j++) {
                var column = $('<td></td>').width('40');
                row.append(column);
            }
            table.append(row);
        }
        $('#base_table').append(table);
        $(window).unbind('keydown').keydown(doKeyDown);

    }

//    function createTriangle(id, x, y, color) {
//        var td = $("#table_map").find("tr").eq(y).find("td").eq(x);
//        td.append($("<div></div>").addClass("moveU").attr("id", id).css("border-bottom", "15px solid " + color));
//    }
    
    function createCharacter(id, x, y, color) {
        var td = $("#table_map").find("tr").eq(y).find("td").eq(x);
        td.append($("<div></div>").addClass("moveU").attr("id", id));
    }

    function doKeyDown(evt) {
        switch (evt.keyCode) {
        case 38: /* Up arrow was pressed */
            $('#test_movie_up').click();
            return;
        case 40: /* Down arrow was pressed */
            $('#test_movie_down').click();
            return;
        case 39: /* Right arrow was pressed */
            $('#test_movie_right').click();
            return;
        case 37: /* Left arrow was pressed */
            $('#test_movie_left').click();
            return;
        }
    }

    function updateMove(name, x, y, direction, isplay) {
        if(isplay&&!checkCollide(name, x, y, direction, isplay)){
            return;
        }
        $("#table_map").find("tr").eq(y).find("td").eq(x).append($("#" + name));
        var obj = $("#" + name);
        obj.removeClass().css({
            borderTop : "",
            borderBottom : "",
            borderLeft : "",
            borderRight : ""
        });
        switch (direction) {
        case "up":
            //obj.addClass("moveU").css("border-bottom", "15px solid " + colors[name]);
            obj.addClass("moveU");
            break;
        case "down":
            //obj.addClass("moveD").css("border-top", "15px solid " + colors[name]);
            obj.addClass("moveD");
            break;
        case "left":
            //obj.addClass("moveL").css("border-right", "15px solid " + colors[name]);
            obj.addClass("moveL");
            break;
        case "right":
            //obj.addClass("moveR").css("border-left", "15px solid " + colors[name]);
            obj.addClass("moveR");
            break;
        }
    }

    function checkCollide(name, x, y, direct, isplay) {
        var result=true;
        playerList.forEach(function(obj){
            if(obj.isPlay&&name != obj.name){
                if(obj.pos.x==x&&obj.pos.y==y){
                    var kill=false;
                    switch(direct){
                    case 'up': 
                        kill = obj.direct!='down';
                        break;
                    case 'down':
                        kill = obj.direct!='up';
                        break;
                    case 'right':
                        kill = obj.direct!='left';
                        break;
                    case 'left':
                        kill = obj.direct!='right';
                        break;
                    }
                    if(kill){
                        result=false;
                        killPlayer(obj);
                    }
                }
            }
        });
        return result;
    }
    
    function killPlayer(obj){
        console.log(obj.name+" collide");
    }

    // init player
    function initPlayers(datails) {
        datails.forEach(function(playerObj){
            //createTriangle(playerObj.name, playerObj.pos.x, playerObj.pos.y, playerObj.color);
            createCharacter(playerObj.name, playerObj.pos.x, playerObj.pos.y, playerObj.color);
            colors[playerObj.name] = playerObj.color;
            if(thisPlayer.name == playerObj.name){
                thisPlayer = playerObj;
            }
        });
    }

    // update position
    function testUpdatePlayers(players) {
        playerList=players;
        for ( var i in players) {
            //var player=jsonData[i];
            var player = players[i];
            updateMove(player.name, player.pos.x, player.pos.y, player.direct, player.isPlay);
        }
    }
    
    window.abc=abc;
    window.initPlayers=initPlayers;
    window.testUpdatePlayers=testUpdatePlayers;
})();