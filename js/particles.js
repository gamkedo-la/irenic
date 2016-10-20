var Particles = new (function() {
  var list = [];

  this.push = function(item) {
    list.push(item);
  };

  this.update = function(time) {
    for (var i = list.length - 1; i >= 0; i--) {
      list[i].update(time);
      if (list[i].readyToRemove) {
        list.splice(i, 1);
      }
    }
  };

  this.draw = function(time) {
    for (var i = 0; i < list.length; i++) {
      list[i].draw(time);
    }
  };

  this.clear = function() {
    list = [];
  };
})();

var ParticleLine = function(points, color) {
  this.readyToRemove = false;

  var spawnTime = Date.now();

  if (!color) {
    color = '#0f0';
  }
  for (var i = 0; i < points.length; i++) {
    points[i].x = points[i].col * (TILE_WIDTH + TILE_GAP) + Math.round(TILE_WIDTH / 2);
    points[i].y = points[i].row * (TILE_HEIGHT + TILE_GAP) + Math.round(TILE_HEIGHT / 2);
  }

  this.draw = function(time) {
    gameContext.beginPath();
    gameContext.moveTo(points[0].x, points[0].y);
    for (var i = 0; i < points.length; i++) {
      gameContext.lineTo(points[i].x, points[i].y);
    }
    gameContext.strokeStyle = color;
    gameContext.lineWidth = 5;
    gameContext.stroke();
  };

  this.update = function(time) {
    this.readyToRemove = Date.now() - spawnTime > 1000;
  };
};
