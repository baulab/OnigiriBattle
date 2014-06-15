// Player object

module.exports = exports = player;

function player(name, color) {
    this.name = name;
    this.color = color;
    this.date = null;
    this.isPlay = false;
}

player.prototype.setPlay = function (isPlay) {
    this.isPlay = isPlay;
}
