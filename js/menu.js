var Menu = new (function() {
  var isActive = false;
  var initialized = false;

  var tiles = [];
  var numTiles = 4;
  var tileC = 100;
  var tileTimer = 0;

  var buttons = [];
  var buttonsDefinitions = [
    {
      label: 'Normal',
      callback: function() {
        gameInitialize(GAME_NORMAL);
      }
    }
  ];

  this.initialize = function() {
    if (!initialized) {
      initialized = true;
      // Replace definitions with button objects
      for (var b = 0; b < buttonsDefinitions.length; b++) {
        buttons.push(new Button(100, 100, buttonsDefinitions[b].label, buttonsDefinitions[b].callback));
      }
    }

    tiles = [];
    for (var i = 0; i < numTiles; i++) {
      tiles.push(new FloatingTile());
    }

    this.activate();
  };

  this.update = function(delta) {
    if (!isActive) {
      return;
    }

    for (var b = 0; b < buttons.length; b++) {
      buttons[b].update();
    }

    for (var t = tiles.length - 1; t >= 0; t--) {
      tiles[t].update(delta);
      if (tiles[t].readyToRemove) {
        tiles.splice(t, 1);
      }
    }

    tileTimer += delta;
    if (tileC < tileTimer) {
      tileTimer = 0;
      tiles.push(new FloatingTile());
      tiles.push(new FloatingTile());
    }
  };

  this.draw = function(interpolationPercentage) {
    if (!isActive) {
      return;
    }

    gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    for (var t = 0; t < tiles.length; t++) {
      tiles[t].draw(interpolationPercentage);
    }

    for (var b = 0; b < buttons.length; b++) {
      buttons[b].draw(interpolationPercentage);
    }
    redrawCanvas();
  };

  this.isActive = function() {
    return isActive;
  };

  this.activate = function() {
    isActive = true;

    MainLoop
      .setUpdate(this.update)
      .setDraw(this.draw)
      .start();
  };

  this.deactivate = function() {
    isActive = false;
  };
})
();

var Button = function(x, y, label, callback) {
  var width = 200;
  var height = 40;

  var cornerSize = 10,
    lineWidth = 4,
    fontColor = '#fff',
    fontColorHover = '#f00',
    fillStyle = '#555',
    strokeStyle = '#888',
    strokeStyleHover = '#f00';

  var hover = false;

  this.update = function() {
    hover = (x < mouse.x && mouse.x < x + width && y < mouse.y && mouse.y < y + height);
    if (hover && mouse.button === 0) {
      mouse.x = mouse.y = -1;
      mouse.button = undefined;

      callback();
    }
  };

  this.draw = function() {
    gameContext.font = gameFont;
    gameContext.textBaseline = 'middle';
    gameContext.textAlign = 'left';

    var color = hover ? fontColorHover : fontColor;
    var stroke = hover ? strokeStyleHover : strokeStyle;

    _drawTextBoxBorder(gameContext, x, y, width, height, cornerSize, lineWidth, fillStyle, stroke);
    drawText(gameContext, x + 10, y + height / 2, color, label);
  };
};

var FloatingTile = function() {
  this.readyToRemove = false;

  var maxLife = random(1800, 2200);
  var age = 0;

  var rotationVelocity = 0.004 - random(0, 0.008, true);
  var angle = random(0, 2 * Math.PI, true);

  var velocity = random(0.13, 0.2, true);
  var velocityDecay = 0.98;
  var direction = random(0, 2 * Math.PI, true);
  var velocityX = velocity * Math.cos(direction);
  var velocityY = velocity * Math.sin(direction);

  var scaleDecay = random(0.98, 0.998, true);
  var scale = 1;

  var x = random(100, 500);
  var y = random(100, 500);
  var lastX, lastY, lastAngle, lastScale;
  var index = random(0, NUM_SPRITES - 1);

  var spriteCol = Grid.indexToCol(index, SPRITE_COLS);
  var spriteRow = Grid.indexToRow(index, SPRITE_COLS);
  var spriteX = spriteCol * TILE_WIDTH;
  var spriteY = spriteRow * TILE_HEIGHT;

  this.update = function(delta) {
    lastX = x;
    lastY = y;
    lastAngle = angle;
    lastScale = scale;

    age += delta;

    velocityX *= velocityDecay;
    velocityY *= velocityDecay;

    x += velocityX * delta;
    y += velocityY * delta;

    angle += rotationVelocity * delta;
    scale *= scaleDecay;

    var outOfBounds = (x < 0) || (y < 0) || (gameCanvas.width < x) || (gameCanvas.height < y);
    this.readyToRemove = (maxLife < age) || (scale < 0.15) || outOfBounds;
  };

  this.draw = function(interpolationPercentage) {
    var drawX = lastX + (x - lastX) * interpolationPercentage,
      drawY = lastY + (y - lastY) * interpolationPercentage,
      drawAngle = lastAngle + (angle - lastAngle) * interpolationPercentage,
      drawScale = lastScale + (scale - lastScale) * interpolationPercentage,
      drawWidth = TILE_WIDTH * drawScale,
      drawHeight = TILE_HEIGHT * drawScale;

    gameContext.save();
    gameContext.globalAlpha = scale;
    gameContext.translate(drawX, drawY);
    gameContext.rotate(drawAngle);
    gameContext.drawImage(Images.tiles, spriteX, spriteY, TILE_WIDTH, TILE_HEIGHT, - drawWidth / 2, - drawHeight / 2, drawWidth, drawHeight);
    gameContext.restore();
  };
};
