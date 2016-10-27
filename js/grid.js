var gameModes = [];
const GAME_NORMAL = 1;

gameModes[GAME_NORMAL] = {
  numTileTypes: 20,
  extraTiles: 0,
  gravityType: false
};

var Grid = new (function() {
  var numTiles = GRID_ROWS * GRID_COLS;
  var tile1, tile2;
  var tiles = [];
  var extraTiles = [];
  var gameMode;

  this.start = function(_gameMode) {
    if (_gameMode && gameModes[_gameMode]) {
      gameMode = gameModes[_gameMode];
    }
    else {
      gameMode = gameModes[GAME_NORMAL];
    }

    // Clear out old tiles and find some new ones.
    tiles = [];
    var tileTypes = [];
    for (var t = 0; t < gameMode.numTileTypes; t++) {
      tileTypes.push(Math.floor(Math.random() * NUM_SPRITES));
    }

    var candidate;
    while (tiles.length < numTiles) {
      candidate = tileTypes[Math.floor(Math.random() * tileTypes.length)];
      tiles.push(new Tile(candidate), new Tile(candidate));
    }
    if (gameMode.extraTiles) {
      while (extraTiles.length < gameMode.extraTiles) {
        candidate = tileTypes[Math.floor(Math.random() * tileTypes.length)];
        extraTiles.push(new Tile(candidate), new Tile(candidate));
      }
    }

    matchesToFind = (tiles.length + extraTiles.length) / 2;

    this.shuffle();

    var i = 0;
    for (var c = 0; c < GRID_COLS; c++) {
      for (var r = 0; r < GRID_ROWS; r++) {
        tiles[i].reset();
        i++;
      }
    }
  };

  this.shuffle = function() {
    for (var i = numTiles - 1; i > 0; i--) {
      if (!tiles[i]) {
        continue;
      }

      var loops = 0;
      do {
        var j = Math.floor(Math.random() * (i + 1));
      } while (loops++ < 5 && (i == j || !tiles[j]));

      var temp = tiles[i];
      tiles[i] = tiles[j];
      tiles[j] = temp;

      tiles[i].placeAtIndex(i);
      tiles[j].placeAtIndex(j);
    }
  };

  this.update = function(time) {
    var updateTilePositions = false;
    for (var i = numTiles - 1; i >= 0; i--) {
      if (!tiles[i]) {
        continue;
      }

      tiles[i].update(time);
      if (tiles[i].readyToRemove) {
        tiles[i] = false;
        updateTilePositions = true;
      }
    }

    if (updateTilePositions) {
      this.updateGravity();
      if (!this.hasValidPair()) {
        this.shuffle();
      }
    }
  };

  this.updateGravity = function() {
    if (!gameMode.gravityType) {
      return false;
    }
    // @todo add gravity stuff
  };

  this.draw = function(time) {
    for (var i = 0; i < numTiles; i++) {
      if (tiles[i]) {
        tiles[i].draw(time);
      }
    }
  };

  this.touch = function(x, y) {
    var index = this.coordsToArrayIndex(x, y);
    if (index >= 0 && tiles[index]) {
      this._touch(tiles[index]);
    }
  };

  this.removeTile = function(i) {
    if (!debug || !tiles[i]) {
      return;
    }

    tiles[i].readyToRemove = true;
  };

  function resetTouchedTiles() {
    if (tile1) {
      tile1.active = false;
    }
    if (tile2) {
      tile2.active = false;
    }
    tile1 = tile2 = undefined;
  }

  this._touch = function(tile) {
    if (tile.readyToRemove) {
      return;
    }

    var path = undefined;

    if (!tile1) {
      tile1 = tile;
      tile1.active = true;
    }
    else if (!tile2 && tile == tile1) {
      resetTouchedTiles();
    }
    else if (!tile2) {
      tile2 = tile;
      tile2.active = true;

      if (tile1.index == tile2.index && (path = this.validPathBetweenTiles(tile1, tile2))) {
        tile1.match();
        tile2.match();

        // @todo draw particles-path using path
        Particles.push(new ParticleLine(path));

        resetTouchedTiles();
        matchesToFind--;
        if (matchesToFind == 0) {
          setTimeout(function() {
            winGame();
          }, TIMEOUT_WON_GAME);
        }
      }
      else {
        // @todo shake 'm
        tile1.active = false;
        tile1 = tile;
        tile2 = false;
      }
    }
  };

  this.hasValidPair = function() {
    for (var p1 = 0; p1 < tiles.length - 1; p1++) {
      if (!tiles[p1] || tiles[p1].matching) {
        continue;
      }

      for (var p2 = p1 + 1; p2 < tiles.length; p2++) {
        if (!tiles[p2] || tiles[p2].matching || tiles[p1].index != tiles[p2].index) {
          continue;
        }

        if (this.validPathBetweenTiles(tiles[p1], tiles[p2])) {
          return true;
        }
      }
    }

    return false;
  };

  this.validPathBetweenTiles = function(_tile1, _tile2) {
    var dRow = _tile1.row - _tile2.row;
    var dCol = _tile1.col - _tile2.col;

    var directPath = [
      { col: _tile1.col, row: _tile1.row },
      { col: _tile2.col, row: _tile2.row }
    ];

    // Adjacent tiles
    if ((_tile1.row == _tile2.row && (dCol == 1 || dCol == -1)) || (_tile1.col == _tile2.col && (dRow == 1 || dRow == -1))) {
      return directPath;
    }

    // Direct path between the tiles on the same col or row
    if ((_tile1.col == _tile2.col || _tile1.row == _tile2.row) && this._isClearPath(directPath[0], directPath[1])) {
      return directPath;
    }

    var tile1Lines = this.generateLineSegmentsFrom(_tile1.col, _tile1.row);
    var tile2Lines = this.generateLineSegmentsFrom(_tile2.col, _tile2.row);
    // Debug draw the possible line segments from the selected tiles
//    for (var l = 0; l < tile1Lines.length; l++) {
//      Particles.push(new ParticleLine(tile1Lines[l], '#f00'));
//    }
//    for (l = 0; l < tile2Lines.length; l++) {
//      Particles.push(new ParticleLine(tile2Lines[l], '#00f'));
//    }

    var path = this.getIntersectingPath(tile1Lines, tile2Lines, Math.ceil((_tile1.col + _tile2.col) / 2), Math.ceil((_tile1.row + _tile2.row) / 2));

    if (path) {
      path.unshift({ col: _tile1.col, row: _tile1.row });
      path.push({ col: _tile2.col, row: _tile2.row });
    }

    return path;
  };

  this.generateLineSegmentsFrom = function(col, row) {
    var lines = [
      this._generateLineSegments(col, row, -1, 0),
      this._generateLineSegments(col, row, 1, 0),
      this._generateLineSegments(col, row, 0, -1),
      this._generateLineSegments(col, row, 0, 1)
    ];

    return lines.filter(function(item) {
      return item && item.length > 0;
    });
  };

  this._generateLineSegments = function(col, row, dCol, dRow) {
    var toCol = col, toRow = row;

    while (-1 < toCol && toCol < GRID_COLS &&
    -1 < toRow && toRow < GRID_ROWS && !this.getTileAt(toCol + dCol, toRow + dRow)) {

      toCol += dCol;
      toRow += dRow;
    }

    if (toCol != col || toRow != row) {
      return [
        { col: col, row: row },
        { col: toCol, row: toRow }
      ];
    }

    return false;
  };

  this.getIntersectingPath = function(p1Lines, p2Lines, middleCol, middleRow) {
    var flippingIncrementer = 0;
    var p1, p2;
    var done = false;
    var testCol, testRow;

    // Check intersections between the lines (1 corner-path)
    for (var l1 = 0; l1 < p1Lines.length; l1++) {
      for (var l2 = 0; l2 < p2Lines.length; l2++) {
        if (p1 = this._getIntersectingPoint([p1Lines[l1]], p2Lines[l2][0].col, p2Lines[l2][0].row, p2Lines[l2][1].col, p2Lines[l2][1].row)) {
          return [p1];
        }
      }
    }

    // Check the intersections with a horizontal/vertical line (2 corners-path);
    while (!done) {
      testCol = middleCol + flippingIncrementer;
      testRow = middleRow + flippingIncrementer;

      if (-1 <= testCol && testCol <= GRID_COLS) {
        if (p1 = this._getIntersectingPoint(p1Lines, testCol, -1, testCol, GRID_ROWS)) {
          if (p2 = this._getIntersectingPoint(p2Lines, testCol, -1, testCol, GRID_ROWS)) {
            if (this._isClearPath(p1, p2)) {
              return [p1, p2];
            }
          }
        }
      }

      if (-1 <= testRow && testRow <= GRID_ROWS) {
        if (p1 = this._getIntersectingPoint(p1Lines, -1, testRow, GRID_COLS, testRow)) {
          if (p2 = this._getIntersectingPoint(p2Lines, -1, testRow, GRID_COLS, testRow)) {
            if (this._isClearPath(p1, p2)) {
              return [p1, p2];
            }
          }
        }
      }

      // Increment and flip incrementer for another check
      if (flippingIncrementer <= 0) {
        flippingIncrementer = Math.abs(flippingIncrementer) + 1;
      }
      else {
        flippingIncrementer = -flippingIncrementer;
      }

      done = (GRID_COLS < flippingIncrementer && GRID_ROWS < flippingIncrementer);
    }

    return false;
  };

  this._isClearPath = function(p1, p2) {
    var minCol = Math.min(p1.col, p2.col);
    var maxCol = Math.max(p1.col, p2.col);
    var minRow = Math.min(p1.row, p2.row);
    var maxRow = Math.max(p1.row, p2.row);
    var checkTile;

    for (var c = minCol; c <= maxCol; c++) {
      for (var r = minRow; r <= maxRow; r++) {
        checkTile = this.getTileAt(c, r);
        if (checkTile && checkTile != tile1 && checkTile != tile2) {
          return false;
        }
      }
    }

    return true;
  };

  this._getIntersectingPoint = function(lines, x3, y3, x4, y4) {
    for (var i = 0; i < lines.length; i++) {
      if (this.intersects(lines[i][0].col, lines[i][0].row, lines[i][1].col, lines[i][1].row, x3, y3, x4, y4)) {
        if (x3 == x4) {
          return { col: x3, row: lines[i][0].row };
        }
        else {
          return { col: lines[i][0].col, row: y3 };
        }
      }
    }

    return false;
  };

  this.intersects = function(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {
    var s1_x, s1_y, s2_x, s2_y;
    s1_x = p1_x - p0_x;
    s1_y = p1_y - p0_y;
    s2_x = p3_x - p2_x;
    s2_y = p3_y - p2_y;

    var s, t;
    s = (s1_x * (p0_y - p2_y) - s1_y * (p0_x - p2_x)) / (s1_x * s2_y - s2_x * s1_y);
    t = (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (s1_x * s2_y - s2_x * s1_y);

    return (0 <= s && s <= 1 && 0 <= t && t <= 1);
  };

  this.getTileAt = function(col, row) {
    if (0 <= col && col < GRID_COLS && 0 <= row && row < GRID_ROWS) {
      var index = this.tileToIndex(col, row);
      return tiles[index];
    }
    return false;
  };

  this.coordsToArrayIndex = function(x, y) {
    var col = Math.floor((x - GRID_PADDING_WIDTH) / (TILE_GAP + TILE_WIDTH));
    var row = Math.floor((y - GRID_PADDING_HEIGHT) / (TILE_GAP + TILE_HEIGHT));

    if (0 <= col && col < GRID_COLS && 0 <= row && row < GRID_ROWS) {
      return this.tileToIndex(col, row);
    }

    return -1;
  };

  this.indexToCol = function(index, num_cols) {
    return index - (this.indexToRow(index, num_cols) * num_cols);
  };

  this.indexToRow = function(index, num_cols) {
    return Math.floor(index / num_cols);
  };

  this.tileToIndex = function(col, row) {
    return (col + GRID_COLS * row);
  };

})();
