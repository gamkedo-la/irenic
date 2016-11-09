var Tile = function(tileIndex) {
  this.tileType = tileIndex;
  var spriteCol = Grid.indexToCol(tileIndex, SPRITE_COLS);
  var spriteRow = Grid.indexToRow(tileIndex, SPRITE_COLS);
  var halfWidth = TILE_WIDTH / 2;
  var halfHeight = TILE_HEIGHT / 2;

  this.matching = 0;
  this.readyToRemove = false;
  this.active = false;
  this.hintTimer = 0;

  this.x = undefined;
  this.y = undefined;
  this.row = 0;
  this.col = 0;
  this.spriteX = spriteCol * TILE_WIDTH;
  this.spriteY = spriteRow * TILE_HEIGHT;

  var tween;

  this.placeAtIndex = function(index) {
    this.col = Grid.indexToCol(index);
    this.row = Grid.indexToRow(index);
  };

  this.moveIntoPosition = function(wait) {
    if (this.x == undefined || this.x < 0) {
      this.x = random(TILE_WIDTH / 2, GRID_COLS * TILE_WIDTH - TILE_WIDTH / 2);
      this.y = -TILE_HEIGHT;
    }

    var coordsCurrent = {
      x: this.x,
      y: this.y
    };

    var coordsTo = {
      x: this.col * (TILE_WIDTH + TILE_GAP) + GRID_PADDING_WIDTH + halfWidth,
      y: this.row * (TILE_HEIGHT + TILE_GAP) + GRID_PADDING_HEIGHT + halfHeight
    };

    // Skip moving if we're still in the same spot
    if (this.x == coordsTo.x && this.y == coordsTo.y) {
      return this;
    }

    var t = this;

    if (tween) {
      tween.stop();
    }

    tween = new TWEEN.Tween(coordsCurrent)
      .to(coordsTo, random(400, 600))
      .easing(TWEEN.Easing.Back.Out)
      .onUpdate(function() {
        t.x = coordsCurrent.x;
        t.y = coordsCurrent.y;
      })
      .onComplete(function() {
        tween = undefined;
      });

    if (0 < wait) {
      setTimeout(function() {
        tween.start();
      }, wait);
    }
    else {
      tween.start();
    }

    return this;
  };

  this.update = function(delta) {
    if (0 < this.matching) {
      this.matching -= delta;
    }
    if (0 < this.hintTimer) {
      this.hintTimer -= delta;
      if (this.hintTimer < 0) {
        this.hintTimer = 0;
      }
    }

    this.readyToRemove = this.readyToRemove || (this.matching < 0);
  };

  this.draw = function() {
    if (this.readyToRemove) {
      return;
    }

    var imageName = 'tiles_' + settings['theme'];
    if (this.active || this.matching || this.hintTimer) {
      imageName += '_active';
    }
    else if (this.hover()) {
      imageName += '_hover';
    }

    gameContext.save();
    gameContext.translate(this.x, this.y);
    if (this.hintTimer) {
      gameContext.rotate(random(-0.2, 0.2, true));
    }
    gameContext.drawImage(Images[imageName], this.spriteX, this.spriteY, TILE_WIDTH, TILE_HEIGHT, -halfWidth, -halfHeight, TILE_WIDTH, TILE_HEIGHT);
    gameContext.restore();
  };

  this.bounds = function() {
    return {
      top: this.y - halfHeight,
      bottom: this.y + halfHeight,
      left: this.x - halfWidth,
      right: this.x + halfWidth
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

  this.isMatched = function() {
    return this.matching > 0;
  };

  this.hint = function() {
    this.hintTimer = 800;
  };
};
