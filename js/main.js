var drawCanvas, drawContext;
var gameCanvas, gameContext;

var settings = {
  sound: true,
  timer: true,
  theme: 'classic'
};

var mouse = {
  x: 0,
  y: 0
};

var screenShakeAmount = 0;
var screenShakeAmountHalf = 0;

var Randomizer;

// Make sure redrawCanvas is called each draw-cycle by default.
var MainLoop_setDraw = MainLoop.setDraw;
MainLoop.setDraw = function(fun) {
  fun = fun || function() {};
  return MainLoop_setDraw.call(this, function(interpolationPercentage) {
    gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    fun(interpolationPercentage);

    setShadow('#000', 6);
    gameContext.font = titleFont;
    gameContext.textBaseline = 'top';
    gameContext.textAlign = 'center';
    drawText(gameContext, gameCanvas.width / 2, 7, fontColor, 'Irenic');
    resetShadow();
    redrawCanvas();
  });
};

// Make sure TWEEN.update is called each update-cycle by default.
var MainLoop_setUpdate = MainLoop.setUpdate;
MainLoop.setUpdate = function(fun) {
  fun = fun || function() {};
  return MainLoop_setUpdate.call(this, function(delta) {
    fun(delta);
    TWEEN.update();
  });
};

window.onload = function() {
  gameCanvas = document.getElementById('gameCanvas');
  gameContext = gameCanvas.getContext('2d');

  initDrawingCanvas();

  Randomizer = Fdrandom.hot();

  Sounds.initialize(function() {
    Music.initialize(function() {
      Images.initialize(menuInitialize);
    })
  });

  MainLoop.setMaxAllowedFPS(30);

  var _settings = JSON.parse(localStorage.getItem('settings'));
  if (_settings) {
    settings = _settings;
  }
};

function setBackground() {
  document.body.style.backgroundImage = '';
  if (Images['background_' + settings.theme]) {
    document.body.style.backgroundImage = 'url(' + Images['background_' + settings.theme].src + ')';
  }
}

function menuInitialize() {
  setBackground();
  setupInput();
  Buttons.initialize();
  Menu.initialize();
  EndGame.initialize();

  var loading = document.getElementById('loading');
  loading.style.display = 'none';
}

function gameInitialize(gameMode) {
  Grid.start(gameMode || GAME_NORMAL);

  Menu.deactivate();

  MainLoop
    .stop()
    .setUpdate(gameUpdate)
    .setDraw(gameDraw)
    .start();
}

function shakeScreen(amount) {
  screenShakeAmountHalf = amount / 2;
  screenShakeAmount = amount;
}

function setSetting(setting, value) {
  settings[setting] = value;

  if (localStorage && localStorage.setItem) {
    localStorage.setItem('settings', JSON.stringify(settings));
  }

  if (setting == 'theme') {
    setBackground();
  }

  return settings[setting];
}

function gameUpdate(delta) {
  Buttons.update();
  Grid.update(delta);
  Particles.update(delta);
}

function gameDraw(interpolationPercentage) {
  gameContext.save();

  if (screenShakeAmount) {
    if (screenShakeAmount < screenShakeAmountHalf) {
      screenShakeAmount *= 0.75;
    }
    else {
      screenShakeAmount *= 0.95;
    }

    gameContext.translate(Math.random() * screenShakeAmount - screenShakeAmount * 0.5, Math.random() * screenShakeAmount - screenShakeAmount * 0.5);

    if (screenShakeAmount <= 0.02) {
      screenShakeAmount = 0;
    }
  }

  Grid.draw(interpolationPercentage);
  Particles.draw(interpolationPercentage);
  Buttons.draw();

  gameContext.restore();
}

// Make sure we can handle the game when it has fallen too far behind real time.
// For example when the browser window is hidden or moved to the background.
MainLoop.setEnd(function(fps, panic) {
  if (panic) {
    var discardedTime = Math.round(MainLoop.resetFrameDelta());
    console.warn('Main loop panicked, probably because the browser tab was put in the background. Discarding ' + discardedTime + 'ms');
  }
});
