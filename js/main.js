const TILE_WIDTH = 44;
const TILE_HEIGHT = 55;
const TILE_GAP = 2;

// 13x13 fills the whole board
const GRID_COLS = 14;
const GRID_ROWS = 13;

const NUM_SPRITES = 42;
const SPRITE_COLS = 9;

const TIMEOUT_IS_MATCH = 700;
const TIMEOUT_NO_MATCH = 1200;
const TIMEOUT_WON_GAME = 2000;

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

// @todo use https://github.com/IceCreamYou/MainLoop.js
var lastRender;

var screenShakeAmount = 0;
var screenShakeAmountHalf = 0;

var matchesToFind = 0;

// Debug
var debug = true;

window.onload = function () {
  gameCanvas = document.getElementById('gameCanvas');
  gameContext = gameCanvas.getContext('2d');

  Images.initialize(gameInitialize);
};

function gameInitialize() {
  setupInput();
  Grid.start(GAME_NORMAL);
  lastRender = Date.now();
  requestNextAnimationFrame(gameLoop);
}

function shakeScreen(amount) {
  screenShakeAmountHalf = amount / 2;
  screenShakeAmount = amount;
}

function countdownTime(duration) {
  return Date.now() - lastRender + duration;
}

function winGame() {
  // @todo do something else..
  alert('you won!');
  Particles.clear();
  // @todo activate menu
  Grid.reset(GAME_NORMAL);
}

function gameLoop() {
  var time = Date.now() - lastRender;
  Grid.update(time);
  Particles.update(time);

  gameContext.save();

  if (screenShakeAmount) {
    if (screenShakeAmount < screenShakeAmountHalf) {
      screenShakeAmount *= 0.75;
    }
    else {
      screenShakeAmount *= 0.95;
    }

    gameContext.translate(Math.random()*screenShakeAmount-screenShakeAmount*0.5, Math.random()*screenShakeAmount-screenShakeAmount*0.5);

    if (screenShakeAmount <= 0.02) {
      screenShakeAmount = 0;
    }
  }

  gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  Grid.draw(time);
  Particles.draw(time);

  gameContext.restore();

  requestNextAnimationFrame(gameLoop);
}
