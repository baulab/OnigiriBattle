// Player object

module.exports = exports = player;

function player(name, color, uuid, socketInstance) {
  this.name = name;
  this.color = color;
  this.uuid = uuid;
  this.date = null;
  this.isPlay = false;
  this.direct = 'up';
  this.isDead = false;
  this.pos = {};
  this.old_pos = {};
  this.pos_limits = {
    x_min : 0,
    x_max : 29,
    y_min : 0,
    y_max : 11
  };
  this.socket={};
}

player.prototype.setPlay = function(isPlay) {
  this.isPlay = isPlay;
}

player.prototype.randomPos = function() {
  this.pos = {
    x : Math.floor(Math.random() * (this.pos_limits.x_max - this.pos_limits.x_min + 1)) + this.pos_limits.x_min,
    y : Math.floor(Math.random() * (this.pos_limits.y_max - this.pos_limits.y_min + 1)) + this.pos_limits.y_min,
  };
}
