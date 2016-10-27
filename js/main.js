const TILE_WIDTH = 44;
const TILE_HEIGHT = 55;
const TILE_GAP = 2;
const GRID_PADDING_WIDTH = 44;
const GRID_PADDING_HEIGHT = 100;

// 14x13 fills the whole board
const GRID_COLS = 2;
const GRID_ROWS = 3;

const NUM_SPRITES = 42;
const SPRITE_COLS = 9;

const TIMEOUT_IS_MATCH = 700;
const TIMEOUT_NO_MATCH = 1200;
const TIMEOUT_WON_GAME = 2000;

var drawCanvas, drawContext;
var gameCanvas, gameContext;

var titleFont = 'bold 40pt Steel City Comic';
var gameFont = '20pt Steel City Comic';
var gameFontSmall = '16pt Steel City Comic';
var fontColor = '#eee';

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

var matchesToFind = 0;

// Debug
var debug = true;

// Make sure redrawCanvas is called each draw-cycle by default.
var MainLoop_setDraw = MainLoop.setDraw;
MainLoop.setDraw = function(fun) {
  fun = fun || function() {};
  return MainLoop_setDraw.call(this, function(interpolationPercentage) {
    gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    gameContext.font = titleFont;
    gameContext.textBaseline = 'top';
    gameContext.textAlign = 'center';
    drawText(gameContext, gameCanvas.width / 2, 10, fontColor, 'Irenic');
    fun(interpolationPercentage);
    redrawCanvas();
  });
};

window.onload = function() {
  gameCanvas = document.getElementById('gameCanvas');
  gameContext = gameCanvas.getContext('2d');

  initDrawingCanvas();

  Images.initialize(menuInitialize);
  MainLoop.setMaxAllowedFPS(30);

  var _settings = JSON.parse(localStorage.getItem('settings'));
  if (_settings) {
    settings = _settings;
  }
};

function menuInitialize() {
  setupInput();
  Menu.initialize();
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

function winGame() {
  // @todo do something else..
  alert('you won!');
  Particles.clear();
  // @todo activate menu
  Menu.activate();
}

function setSetting(setting, value) {
  settings[setting] = value;

  if (localStorage && localStorage.setItem) {
    localStorage.setItem('settings', JSON.stringify(settings));
  }

  return settings[setting];
}

function gameUpdate(delta) {
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

  gameContext.restore();
}
