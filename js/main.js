const TILE_WIDTH = 44;
const TILE_HEIGHT = 55;
const TILE_GAP = 2;

// 14x13 fills the whole board
const GRID_COLS = 4;
const GRID_ROWS = 3;

const NUM_SPRITES = 42;
const SPRITE_COLS = 9;

const TIMEOUT_IS_MATCH = 700;
const TIMEOUT_NO_MATCH = 1200;
const TIMEOUT_WON_GAME = 2000;

var drawCanvas, drawContext;
var gameCanvas, gameContext;

var gameFontHuge = '50pt Verdana';
var gameFont = 'bold 20pt Verdana';
var gameFontSmall = '16pt Verdana';
var gameFontExtraSmall = '10pt Verdana';
var fontColor = '#ddd';
var fontColorHighlight = '#eee';

var mouse = {
  x: 0,
  y: 0
};

var screenShakeAmount = 0;
var screenShakeAmountHalf = 0;

var matchesToFind = 0;

// Debug
var debug = true;

window.onload = function() {
  gameCanvas = document.getElementById('gameCanvas');
  gameContext = gameCanvas.getContext('2d');

  initDrawingCanvas();

  Images.initialize(menuInitialize);
  MainLoop.setMaxAllowedFPS(30);
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

  gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  Grid.draw(interpolationPercentage);
  Particles.draw(interpolationPercentage);

  gameContext.restore();

  redrawCanvas();
}
