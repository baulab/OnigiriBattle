(function(){
    /**
     * New node file
     */
    var colors = {};
    var myuuid = "";
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
            var row = $('<tr></tr>').height('30');
            for (j = 1; j <= 30; j++) {
                var column = $('<td></td>').width('30');
                row.append(column);
            }
            table.append(row);
        }
        $('#base_table').append(table);
        //$(window).unbind('keydown').keydown(doKeyDown);
        window.removeEventListener("keypressed", doKeyDown, false);
        window.removeEventListener("keypressed", doKeyUp, false);
        window.addEventListener("keypressed", doKeyDown, false);
        window.addEventListener("keypressed", doKeyUp, false);
    }

    function createTriangle(player) {
        var td = $("#table_map").find("tr").eq(player.pos.y).find("td").eq(player.pos.x);
        td.append($("<div></div>").addClass("moveU")
                .attr({id:player.name, uuid:player.uuid})
                .css("border-bottom", "15px solid " + player.color));
    }
    
    var isRunning = false;
    var event;
    
    function doKeyUp(evt) {
        if (event == evt) {
            isRunning = false;
        }
    }

    function doKeyDown(evt) {
        if (isRunning) return;
        
        event = evt;
        isRunning = true;
        
        var playerIndex = findPlayerByUUID(myuuid);
        if(playerIndex>=0){
            switch (evt.keyCode) {
            case 38: /* Up arrow was pressed */
                var y = playerList[playerIndex].pos.y;
                if(y>0){
                    y--;
                }
                updateMove(playerList[playerIndex].name, playerList[playerIndex].pos.x, y, "up", true);
                break;
            case 40: /* Down arrow was pressed */
                var y = playerList[playerIndex].pos.y;
                if(y<playerList[playerIndex].pos_limits.y_max){
                    y++;
                }
                updateMove(playerList[playerIndex].name, playerList[playerIndex].pos.x, y, "down", true);
                break;
            case 39: /* Right arrow was pressed */
                var x = playerList[playerIndex].pos.x;
                if(x<playerList[playerIndex].pos_limits.x_max){
                    x++;
                }
                updateMove(playerList[playerIndex].name, x, playerList[playerIndex].pos.y, "right", true);
                break;
            case 37: /* Left arrow was pressed */
                var x = playerList[playerIndex].pos.x;
                if(x>0){
                    x--;
                }
                updateMove(playerList[playerIndex].name, x, playerList[playerIndex].pos.y, "left", true);
                break;
            }
        }
    }
    
    function findPlayerByUUID(uuid){
        for(var i=0; i<playerList.length; i++){
            if(playerList[i].uuid == uuid){
                return i;
            }
        }
        return -1;
    }
    
    var temp = {name : "", x : "", y: "", direction: ""};
    
    function updateMove(name, x, y, direction, isplay) {
        if(isplay&&!checkCollide(name, x, y, direction, isplay)){
            return;
        }
        
        if (temp.name == name && temp.x == x && temp.y == y && temp.direction == direction) {
            return;
        }
        
        console.log("update move: %s, %s, (%s, %s)", name, direction, x, y);
        _socket.emit('playerMoved', {direct: direction});
        temp = {name: name, x: x, y: y, direction: direction};
        
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
            obj.addClass("moveU").css("border-bottom", "15px solid " + colors[name]);
            break;
        case "down":
            obj.addClass("moveD").css("border-top", "15px solid " + colors[name]);
            break;
        case "left":
            obj.addClass("moveL").css("border-right", "15px solid " + colors[name]);
            break;
        case "right":
            obj.addClass("moveR").css("border-left", "15px solid " + colors[name]);
            break;
        }
    }
    var xxx = 0;
    function checkCollide(name, x, y, direct, isplay) {
        var result=true;
        playerList.forEach(function(obj){
            console.log(++xxx);
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
    function initPlayers(datails, uuid) {
        console.log("\t my uuid:", uuid);
        myuuid = uuid;
        datails.forEach(function(playerObj){
            createTriangle(playerObj);
            colors[playerObj.name] = playerObj.color;
        });
    }

    // update position
    function updatePlayersPos(players) {
        playerList=players;
        //console.log("\t updatePlayersPos", playerList);
        for ( var i in players) {
            var player = players[i];
            if(player.uuid!=myuuid){
                updateMove(player.name, player.pos.x, player.pos.y, player.direct, player.isPlay);
            }
        }
    }
    
    window.abc=abc;
    window.initPlayers=initPlayers;
    window.updatePlayersPos=updatePlayersPos;
})();