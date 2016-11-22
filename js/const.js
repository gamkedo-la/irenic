// Debug
const DEBUG = true;

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
const NUM_HISCORE = 5;

const TIMEOUT_IS_MATCH = 700;
const TIMEOUT_NO_MATCH = 1200;
const TIMEOUT_WON_GAME = 800;

const REMOVE_SCORE_TIME = 1000;
const REMOVE_MOVEMENT_TIME = 500;
const REMOVE_BOUNCE_TIME = 1000;
const REMOVE_SMOKE_TIME = 400;

const KEY_ESC = 27;

var playerHoverForButton;

var titleFont = 'bold 34pt Steel City Comic';
var gameFont = '20pt Steel City Comic';
var gameFontSmall = '16pt Steel City Comic';
var fontColor = '#eee';
var textLineHeight = 25;

var gameModes = [];
const GAME_NORMAL = 1;
const GAME_MODERN = 2;
const GAME_ADVANCED = 3;
const GAME_FUNKY = 4;
var gameModeKeys = [GAME_NORMAL, GAME_MODERN, GAME_ADVANCED, GAME_FUNKY];

const GRAVITY_DOWN = 1;
const GRAVITY_SIDES = 2;
const GRAVITY_FUNKY = 99;
var gravityTypes = [GRAVITY_DOWN, GRAVITY_SIDES];

gameModes[GAME_NORMAL] = {
  label: 'Normal',
  numTileTypes: 30,
  extraTileCols: 0,
  extraTileRows: 0,
  gravityType: false,
  timeTotal: 180000,
  timeStep: 10000,
  numHints: 10,
  numShuffles: 10
};

gameModes[GAME_MODERN] = {
  label: 'Modern',
  numTileTypes: 36,
  extraTileCols: GRID_COLS,
  extraTileRows: 5,
  gravityType: GRAVITY_DOWN,
  timeTotal: 120000,
  timeStep: 5000,
  numHints: 6,
  numShuffles: 6
};

gameModes[GAME_ADVANCED] = {
  label: 'Advanced',
  numTileTypes: 42,
  extraTileRows: GRID_ROWS,
  extraTileCols: 8,
  gravityType: GRAVITY_SIDES,
  timeTotal: 60000,
  timeStep: 2000,
  numHints: 3,
  numShuffles: 3
};

gameModes[GAME_FUNKY] = {
  label: 'Funky',
  numTileTypes: 42,
  extraTileCols: 10,
  extraTileRows: 10,
  gravityType: GRAVITY_FUNKY,
  timeTotal: 60000,
  timeStep: 2000,
  numHints: 3,
  numShuffles: 3
};
