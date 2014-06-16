// Player object

module.exports = exports = player;

function player(name, color, uuid) {
    this.name = name;
    this.color = color;
    this.uuid = uuid;
    this.date = null;
    this.isPlay = false;
}

player.prototype.setPlay = function (isPlay) {
    this.isPlay = isPlay;
}
