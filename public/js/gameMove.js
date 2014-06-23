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
        window.addEventListener("keypressed", doKeyDown, false);
    }

    function createTriangle(player) {
        var characterColor = "";
        if(player.color=='black'){
            characterColor = 'moveBlackU';
        }else if(player.color=='blue'){
            characterColor = 'moveBlueU'
        }else if(player.color=='green'){
            characterColor = 'moveGreenU'
        }else if(player.color=='orange'){
            characterColor = 'moveOrangeU'
        }else if(player.color=='pink'){
            characterColor = 'movePinkU'
        }else if(player.color=='purple'){
            characterColor = 'movePurpleU'
        }else if(player.color=='red'){
            characterColor = 'moveRedU'
        }else if(player.color=='yellow'){
            characterColor = 'moveYellowU'
        }
        var td = $("#table_map").find("tr").eq(player.pos.y).find("td").eq(player.pos.x);
        td.append($("<div></div>").addClass("move " + characterColor)
                .attr({id:player.name, uuid:player.uuid}));
    }

    function doKeyDown(evt) {
        var playerIndex = findPlayerByUUID(myuuid);
        if(playerIndex>=0){
            switch (evt.keyCode) {
            case 38: /* Up arrow was pressed */
                _socket.emit('playerMoved', {direct: 'up'});
                var y = playerList[playerIndex].pos.y;
                if(y>0){
                    y--;
                }
                updateMove(playerList[playerIndex].name, playerList[playerIndex].pos.x, y, "up", true);
                break;
            case 40: /* Down arrow was pressed */
                _socket.emit('playerMoved', {direct: 'down'});
                var y = playerList[playerIndex].pos.y;
                if(y<playerList[playerIndex].pos_limits.y_max){
                    y++;
                }
                updateMove(playerList[playerIndex].name, playerList[playerIndex].pos.x, y, "down", true);
                break;
            case 39: /* Right arrow was pressed */
                _socket.emit('playerMoved', {direct: 'right'});
                var x = playerList[playerIndex].pos.x;
                if(x<playerList[playerIndex].pos_limits.x_max){
                    x++;
                }
                updateMove(playerList[playerIndex].name, x, playerList[playerIndex].pos.y, "right", true);
                break;
            case 37: /* Left arrow was pressed */
                _socket.emit('playerMoved', {direct: 'left'});
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
    
    function updateMove(name, x, y, direction, isplay) {
        var characterColor = "";
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
        
        if(colors[name] == "black"){
            characterColor = "moveBlack";
        }else if(colors[name]=='blue'){
            characterColor = 'moveBlue'
        }else if(colors[name]=='green'){
            characterColor = 'moveGreen'
        }else if(colors[name]=='orange'){
            characterColor = 'moveOrange'
        }else if(colors[name]=='pink'){
            characterColor = 'movePink'
        }else if(colors[name]=='purple'){
            characterColor = 'movePurple'
        }else if(colors[name]=='red'){
            characterColor = 'moveRed'
        }else if(colors[name]=='yellow'){
            characterColor = 'moveYellow'
        }
        switch (direction) {
        case "up":
            //obj.addClass("moveU").css("border-bottom", "15px solid " + colors[name]);
            obj.addClass("move " +characterColor+ "U");
            break;
        case "down":
            //obj.addClass("moveD").css("border-top", "15px solid " + colors[name]);
            obj.addClass("move " +characterColor+ "D");
            break;
        case "left":
            //obj.addClass("moveL").css("border-right", "15px solid " + colors[name]);
            obj.addClass("move " +characterColor+ "L");
            break;
        case "right":
            //obj.addClass("moveR").css("border-left", "15px solid " + colors[name]);
            obj.addClass("move " +characterColor+ "R");
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