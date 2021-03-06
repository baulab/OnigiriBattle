// Chatroom singleton

module.exports = exports = new chatroom;

function chatroom() {
    this.playerList = [];
    this.host = null;
    this.isStart = false;
}

chatroom.prototype.addPlayer = function(player) {
    if (player.name) {
        // Get entry time.
        player.date = new Date;
        this.playerList.push(player);
        this.host = updateHost(this.playerList);
    } 
};

chatroom.prototype.removePlayer = function(name) {
    var i = 0;
    for (; i < this.playerList.length; i++) {
        if (this.playerList[i].name == name) {
            break;
        }
    }
    // Remove from array and rearrange.
    this.playerList.splice(i, 1);
    this.host = updateHost(this.playerList);
};

chatroom.prototype.updatePlayer = function(player) {
    for (var i = 0; i < this.playerList.length; i++) {
        if (this.playerList[i].name == player.name) {
            this.playerList[i] = player;
        }
    }
    this.host = updateHost(this.playerList);
};

function updateHost(playerList) {
    var sorting = [];
    for (var i = 0; i < playerList.length; i++) {
        if (playerList[i].isPlay) {
            sorting.push(playerList[i]);
        }
    }

    // Sort by entry time
    sorting.sort(function(playerA, playerB) {
        return playerA.date.getTime() - playerB.date.getTime();
    });

    if (sorting.length > 0) {
        return sorting[0].name;
    };

    return null;
}

