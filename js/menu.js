var Menu = new (function() {
  var isActive = false;
  var initialized = false;
  var showCredits = false;
  var showHiscore = false;
  var backButton;

  var tiles = [];
  var tileSpawnTime = 100;
  var tileTimer = 0;

  var colWidth;
  var canvasCenter;
  var creditsLineHeight = 25;
  var hiscoreRowY;

  var buttons = [];
  var credits = [
    'SpadXIII - Team lead, coding',
    'Chris DeLeon - Tileset Crosspoint',
    'Micky Turner - Sounds',
    ''
  ];

  var gameModes = [GAME_NORMAL, GAME_MODERN, GAME_ADVANCED, GAME_FUNKY];
  var gameModesLabels = {};
  gameModesLabels[GAME_NORMAL] = 'Normal';
  gameModesLabels[GAME_MODERN] = 'Modern';
  gameModesLabels[GAME_ADVANCED] = 'Advanced';
  gameModesLabels[GAME_FUNKY] = 'Funky';

  this.initialize = function() {
    if (!initialized) {
      canvasCenter = gameCanvas.width / 2;
      colWidth = (gameCanvas.width - 200) / 4;
      hiscoreRowY = 200 + 2 * creditsLineHeight;

      initialized = true;

      buttons.push(new ButtonText(100, 100, 'Normal', buttonStartGame, GAME_NORMAL));
      buttons.push(new ButtonText(100, 150, 'Modern', buttonStartGame, GAME_MODERN));
      buttons.push(new ButtonText(100, 200, 'Advanced', buttonStartGame, GAME_ADVANCED));
      buttons.push(new ButtonText(100, 250, 'Funky', buttonStartGame, GAME_FUNKY));
      buttons.push(new ButtonText(100, 325, 'Credits', buttonCredits));
      buttons.push(new ButtonText(100, 375, 'Hiscore', buttonHiscore));

      buttons.push(new ButtonToggle(500, 100, 'theme', 'classic', Images.button_classic, false, buttonToggleTheme));
      buttons.push(new ButtonToggle(500, 160, 'theme', 'numbers', Images.button_numbers, false, buttonToggleTheme));
      buttons.push(new ButtonToggle(500, 220, 'theme', 'crosspoint', Images.button_crosspoint, false, buttonToggleTheme));

      backButton = new ButtonText(100, 100, 'Back', buttonBack);
    }

    tiles = [
      new FloatingTile(),
      new FloatingTile(),
      new FloatingTile(),
      new FloatingTile()
    ];

    this.activate();
  };

  this.update = function(delta) {
    if (!isActive) {
      return;
    }

    Buttons.update();

    var b = 0;
    if (showCredits || showHiscore) {
      backButton.update();
    }
    else {
      for (b = 0; b < buttons.length; b++) {
        buttons[b].update();
      }
    }

    for (var t = tiles.length - 1; t >= 0; t--) {
      tiles[t].update(delta);
      if (tiles[t].readyToRemove) {
        tiles.splice(t, 1);
      }
    }

    tileTimer += delta;
    if (tileSpawnTime < tileTimer) {
      tileTimer = 0;
      tiles.push(new FloatingTile());
      tiles.push(new FloatingTile());
    }
  };

  this.draw = function(interpolationPercentage) {
    if (!isActive) {
      return;
    }

    for (var t = 0; t < tiles.length; t++) {
      tiles[t].draw(interpolationPercentage);
    }

    var i = 0;
    if (showCredits || showHiscore) {
      backButton.draw();

      gameContext.font = gameFontSmall;
      gameContext.textBaseline = 'middle';
      gameContext.textAlign = 'center';
    }

    if (showCredits) {
      _drawTextBoxBorder(gameContext, 100, 180, gameCanvas.width - 200, 20 + credits.length * creditsLineHeight, 16, 4, '#555', '#888');
      for (i = 0; i < credits.length; i++) {
        drawText(gameContext, canvasCenter, 200 + i * creditsLineHeight, '#fff', credits[i]);
      }
    }
    else if (showHiscore) {
      _drawTextBoxBorder(gameContext, 100, 180, gameCanvas.width - 200, 20 + (2 + NUM_HISCORE) * creditsLineHeight, 16, 4, '#555', '#888');

      for (var g = 0; g < gameModes.length; g++) {
        var setting_name = 'hiscore_' + gameModes[g];
        var hiscoreRowX = 100 + g * colWidth + colWidth / 2;

        drawText(gameContext, hiscoreRowX, 200, '#fff', gameModesLabels[gameModes[g]]);

        if (!settings[setting_name]) {
          continue;
        }

        for (i = 0; i < settings[setting_name].length; i++) {
          drawText(gameContext, hiscoreRowX, hiscoreRowY + i * creditsLineHeight, '#fff', settings[setting_name][i]);
        }
      }
    }
    else {
      for (i = 0; i < buttons.length; i++) {
        buttons[i].draw();
      }
    }

    Buttons.draw();
  };

  this.isActive = function() {
    return isActive;
  };

  this.activate = function() {
    Grid.deactivate();
    isActive = true;

    MainLoop
      .stop()
      .setUpdate(this.update)
      .setDraw(this.draw)
      .start();
  };

  this.deactivate = function() {
    isActive = false;
  };

  var buttonStartGame = function(gameMode) {
    gameInitialize(gameMode);
  };

  var buttonCredits = function() {
    showCredits = !showCredits;
  };

  var buttonHiscore = function() {
    showHiscore = !showHiscore;
  };

  var buttonBack = function() {
    showCredits = false;
    showHiscore = false;
  };

  var buttonToggleTheme = function(setting, theme) {
    setSetting('theme', theme);
  };
})();

var _Button = function(x, y, width, height, callback, callbackArguments) {
  this.hover = false;

  this.update = function() {
    this.hover = (x < mouse.x && mouse.x < x + width && y < mouse.y && mouse.y < y + height);
    if (this.hover && callback && mouse.button === 0) {
      mouse.x = mouse.y = -1;
      mouse.button = undefined;

      if (callbackArguments) {
        if (!isArray(callbackArguments)) {
          callbackArguments = [callbackArguments];
        }
        callback.apply(null, callbackArguments);
      }
      else {
        callback();
      }
    }
  };
};

var ButtonToggle = function(x, y, setting, onValue, imageOn, imageOff, callback) {
  var width = imageOn.width;
  var height = imageOn.height;
  var button = new _Button(x, y, width, height, callback, [setting, onValue]);

  this.update = function() {
    button.update();
  };

  this.draw = function() {
    var active = (settings[setting] == onValue);
    var image = (!imageOff || active) ? imageOn : imageOff;
    var scale = (!imageOff && !active) ? 0.7 : 1;
    drawBitmapCenteredWithScaleAndRotation(gameContext, image, x + (width / 2), y + (height / 2), scale);
  };
};

var ButtonText = function(x, y, label, callback, callbackArguments) {
  var width = 200;
  var height = 40;
  var button = new _Button(x, y, width, height, callback, callbackArguments);

  var cornerSize = 10,
    lineWidth = 4,
    fontColorHover = '#f00',
    fillStyle = '#555',
    strokeStyle = '#888',
    strokeStyleHover = '#f00';

  this.update = function() {
    button.update();
  };

  this.draw = function() {
    gameContext.font = gameFont;
    gameContext.textBaseline = 'middle';
    gameContext.textAlign = 'left';

    var color = button.hover ? fontColorHover : fontColor;
    var stroke = button.hover ? strokeStyleHover : strokeStyle;

    _drawTextBoxBorder(gameContext, x, y, width, height, cornerSize, lineWidth, fillStyle, stroke);
    drawText(gameContext, x + 10, y + height / 2, color, label);
  };
};

var FloatingTile = function() {
  this.readyToRemove = false;

  var maxLife = random(1800, 2200);
  var age = 0;

  var rotationVelocity = random(-0.004, 0.004, true);
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
    gameContext.drawImage(Images['tiles_' + settings['theme']], spriteX, spriteY, TILE_WIDTH, TILE_HEIGHT, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    gameContext.restore();
  };
};
