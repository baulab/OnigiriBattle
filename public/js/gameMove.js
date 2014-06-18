/**
 * New node file
 */
var colors = {};
var thisPlayer = {};
function abc() {
    speed = 1;
    
    /**
     * test point
     *
    
     * selfX=2; 
     * selfY=3; 
     * selfId="ABC"; 
     * color="#980000";
     */

    var table = $('<table></table>').attr("border", 1).attr("id", "table_map");
    for (i = 1; i <= 12; i++) {
        var row = $('<tr></tr>').height('30');
        for (j = 1; j <= 30; j++) {
            var column = $('<td></td>').width('30');
            row.append(column);
        }
        table.append(row);
    }
    $('#base_table').append(table);

    // createTriangle(selfId,selfX,selfY,color);

    window.addEventListener('keydown', doKeyDown, true);

}

function createTriangle(id, x, y, color) {
    var td = $("#table_map").find("tr").eq(y).find("td").eq(x);
    td.append($("<div></div>").addClass("moveU").attr("id", id).css("border-bottom", "15px solid " + color));
}

function doKeyDown(evt) {
    console.log(thisPlayer);
    switch (evt.keyCode) {
    case 38: /* Up arrow was pressed */
        if (selfY == 0) {
            thisPlayer.pos.y = 15;
        } else {
            thisPlayer.pos.y = thisPlayer.pos.y - 1;
        }
        $("#table_map").find("tr").eq(thisPlayer.pos.y).find("td").eq(thisPlayer.pos.x).append($("#" + selfId));
        $("#" + selfId).removeClass().css({
            borderTop : "",
            borderBottom : "",
            borderLeft : "",
            borderRight : ""
        }).addClass("moveU").css("border-bottom", "15px solid " + color);
        checkDiedU();
        break;

    case 40: /* Down arrow was pressed */
        if (thisPlayer.pos.y == 15) {
            thisPlayer.pos.y = 0;
        } else {
            thisPlayer.pos.y = thisPlayer.pos.y + 1;
        }
        $("#table_map").find("tr").eq(thisPlayer.pos.y).find("td").eq(thisPlayer.pos.x).append($("#" + selfId));
        $("#" + selfId).removeClass().css({
            borderTop : "",
            borderBottom : "",
            borderLeft : "",
            borderRight : ""
        }).addClass("moveD").css("border-top", "15px solid " + color);
        checkDiedD();
        break;

    case 39: /* Right arrow was pressed */
        if (selfX == 29) {
            thisPlayer.pos.x = 0;
        } else {
            thisPlayer.pos.x = thisPlayer.pos.x + 1;
        }
        $("#table_map").find("tr").eq(thisPlayer.pos.y).find("td").eq(thisPlayer.pos.x).append($("#" + selfId));
        $("#" + selfId).removeClass().css({
            borderTop : "",
            borderBottom : "",
            borderLeft : "",
            borderRight : ""
        }).addClass("moveR").css("border-left", "15px solid " + color);
        checkDiedR();

        break;
    case 37: /* Left arrow was pressed */
        if (thisPlayer.pos.x == 0) {
            thisPlayer.pos.x = 29;
        } else {
            thisPlayer.pos.x = thisPlayer.pos.x - 1;
        }
        $("#table_map").find("tr").eq(thisPlayer.pos.y).find("td").eq(thisPlayer.pos.x).append($("#" + selfId));
        $("#" + selfId).removeClass().css({
            borderTop : "",
            borderBottom : "",
            borderLeft : "",
            borderRight : ""
        }).addClass("moveL").css("border-right", "15px solid " + color);
        checkDiedL();
        break;
    }
}

function updateMove(name, x, y, direction) {
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

function checkDiedU() {

}
function checkDiedD() {

}
function checkDiedL() {

}
function checkDiedR() {

}

// init player
function initPlayers(datails) {
    // var details=$("#testObjs").val();
    // var jsonData = $.parseJSON(details);
    for ( var i in datails) {
        var playerObj = datails[i];
        createTriangle(playerObj.name, playerObj.pos.x, playerObj.pos.y, playerObj.color);
        colors[playerObj.name] = playerObj.color;
        if(player.name = playerObj.name){
            thisPlayer = playerObj;
        }
    }
}

// update position
function testUpdatePlayers(players) {
    //var details=$("#testUpObjs").val();
    //var jsonData = $.parseJSON(details);
    for ( var i in players) {
        //var player=jsonData[i];
        var player = players[i];
        updateMove(player.name, player.pos.x, player.pos.y, player.direct);
    }
}