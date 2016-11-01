const TILE_WIDTH = 44;
const TILE_HEIGHT = 55;
const TILE_GAP = 2;
const GRID_PADDING_WIDTH = 44;
const GRID_PADDING_HEIGHT = 100;

// 14x13 fills the whole board
const GRID_COLS = 14;
const GRID_ROWS = 13;

const NUM_SPRITES = 42;
const SPRITE_COLS = 9;

const TIMEOUT_IS_MATCH = 700;
const TIMEOUT_NO_MATCH = 1200;
const TIMEOUT_WON_GAME = 2000;

const KEY_ESC = 27;

var titleFont = 'bold 40pt Steel City Comic';
var gameFont = '20pt Steel City Comic';
var gameFontSmall = '16pt Steel City Comic';
var fontColor = '#eee';

var gameModes = [];
const GAME_NORMAL = 1;
const GAME_MODERN = 2;
const GAME_ADVANCED = 3;
const GAME_FUNKY = 4;
const GRAVITY_DOWN = 1;

gameModes[GAME_NORMAL] = {
  numTileTypes: 30,
  extraTileRows: 0,
  gravityType: false
};

gameModes[GAME_MODERN] = {
  numTileTypes: 36,
  extraTileRows: 5,
  gravityType: GRAVITY_DOWN
};

gameModes[GAME_ADVANCED] = {
  numTileTypes: 42,
  extraTileRows: 0,
  gravityType: GRAVITY_DOWN
};

gameModes[GAME_FUNKY] = {
  numTileTypes: 42,
  extraTileRows: 10,
  gravityType: GRAVITY_DOWN
};
