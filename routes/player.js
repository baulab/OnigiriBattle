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
    x_min : 8,
    x_max : 392,
    y_min : 8,
    y_max : 392
  };
  this.socket={};
}

player.prototype.setPlay = function(isPlay) {
  if (isPlay) {
    // Update latest date if player is ready to play.
    this.date = new Date;
  }
  this.isPlay = isPlay;
}

player.prototype.randomPos = function() {
  this.pos = {
    x : Math.floor(Math.random() * ((this.pos_limits.x_max - this.pos_limits.x_min) / 8 + 1)) * 8,
    y : Math.floor(Math.random() * ((this.pos_limits.y_max - this.pos_limits.y_min) / 8 + 1)) * 8
  };
}
