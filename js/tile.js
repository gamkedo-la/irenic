var Tile = function(index) {
  this.index = index;
  var spriteCol = Grid.indexToCol(index, SPRITE_COLS);
  var spriteRow = Grid.indexToRow(index, SPRITE_COLS);

  this.matching = 0;
  this.readyToRemove = false;
  this.active = false;

  this.x = 0;
  this.y = 0;
  this.row = 0;
  this.col = 0;
  this.spriteX = spriteCol * TILE_WIDTH;
  this.spriteY = spriteRow * TILE_HEIGHT;

  // @todo do something with first positioning
  // @todo do something with animated shuffling
  this.placeAtIndex = function(index) {
    this.col = Grid.indexToCol(index, GRID_COLS);
    this.row = Grid.indexToRow(index, GRID_COLS);

    this.x = this.col * (TILE_WIDTH + TILE_GAP);
    this.y = this.row * (TILE_HEIGHT + TILE_GAP);

    return this;
  };

  this.reset = function() {
    this.active = false;
    return this;
  };

  this.update = function(delta) {
    if (0 < this.matching) {
      this.matching -= delta;
    }

    this.readyToRemove = this.readyToRemove || (this.matching < 0);
  };

  this.draw = function() {
    if (this.readyToRemove) {
      return;
    }

    var imageName = 'tiles_' + settings['theme'];
    if (this.active || this.matching) {
      imageName += '_active';
    }
    else if (this.hover()) {
      imageName += '_hover';
    }
    gameContext.drawImage(Images[imageName], this.spriteX, this.spriteY, TILE_WIDTH, TILE_HEIGHT, this.x, this.y, TILE_WIDTH, TILE_HEIGHT);
  };

  this.bounds = function() {
    return {
      top: this.y,
      bottom: this.y + TILE_HEIGHT,
      left: this.x,
      right: this.x + TILE_WIDTH
    };
  };

  this.hover = function() {
    var b = this.bounds();
    return b.left < mouse.x && mouse.x < b.right &&
      b.top < mouse.y && mouse.y < b.bottom;
  };

  this.match = function() {
    // @todo removal particle/animation
    this.matching = 500;
  };
};
