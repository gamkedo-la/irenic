var Menu = new (function() {
  var isActive = false;
  var initialized = false;

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

    this.activate();
  };

  this.update = function() {
    if (!isActive) {
      return;
    }

    for (var b = 0; b < buttons.length; b++) {
      buttons[b].update();
    }
  };

  this.draw = function() {
    if (!isActive) {
      return;
    }

    gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    for (var b = 0; b < buttons.length; b++) {
      buttons[b].draw();
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
