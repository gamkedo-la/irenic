var Grid = new (function() {
  var numTiles = GRID_ROWS * GRID_COLS;
  var tile1, tile2;
  var numValidPairs = 0;
  var numTilesRemaining = 0;
  var numExtraRemaining = 0;
  var matchesToFind = 0;
  var numHints = 0;
  var tiles = [];
  var extraTiles = [];
  var gameMode;
  var isActive = false;

  this.start = function(_gameMode) {
    if (_gameMode && gameModes[_gameMode]) {
      gameMode = gameModes[_gameMode];
    }
    else {
      gameMode = gameModes[GAME_NORMAL];
    }

    // Clear out old tiles and find some new ones.
    var candidate;
    var tileTypes = [];
    for (var t = 0; tileTypes.length < gameMode.numTileTypes; t++) {
      candidate = Math.floor(Math.random() * NUM_SPRITES);
      // @todo generate a better set of tiles; not 'completely random'
      if (tileTypes.indexOf(candidate) == -1) {
        tileTypes.push(candidate);
      }
    }

    tiles = this.generateTiles(numTiles, tileTypes);

    extraTiles = [];
    if (gameMode.extraTileRows) {
      extraTiles = this.generateTiles(gameMode.extraTileRows * GRID_COLS, tileTypes);
    }

    numExtraRemaining = extraTiles.length;
    numTilesRemaining = tiles.length + extraTiles.length;
    matchesToFind = (numTilesRemaining) / 2;
    numHints = gameMode.numHints;

    this.shuffle(tiles, true);
    if (gameMode.extraTileRows) {
      this.shuffle(extraTiles);
    }

    isActive = true;
  };

  this.isActive = function() {
    return isActive;
  };

  this.deactivate = function() {
    isActive = false;
  };

  this.generateTiles = function(amount, tileTypes) {
    var candidate;
    var result = [];
    var numCandidates = Math.floor(amount / tileTypes.length);
    for (var n = 0; n < tileTypes.length; n++) {
      for (var a = 0; a < numCandidates; a++) {
        result.push(new Tile(tileTypes[n]));
      }
    }

    // Add a few more random ones
    while (result.length < amount) {
      candidate = tileTypes[Math.floor(Math.random() * tileTypes.length)];
      result.push(new Tile(candidate), new Tile(candidate));
    }

    return result;
  };

  this.shuffle = function(tiles, requirePair) {
    var hasShuffled = false;
    for (var i = tiles.length - 1; i > 0; i--) {
      if (!tiles[i] || tiles[i].matching) {
        continue;
      }

      var loops = 0;
      do {
        var j = Math.floor(Math.random() * (i + 1));
      } while (loops++ < 10 && (i == j || !tiles[j] || tiles[j].matching));

      // If after 10 loops we still did not find a valid j index, skip it.
      if (!tiles[j] || tiles[j].matching) {
        continue;
      }

      hasShuffled = true;

      var temp = tiles[i];
      tiles[i] = tiles[j];
      tiles[j] = temp;

      tiles[i].placeAtIndex(i);
      tiles[j].placeAtIndex(j);
    }

    if (requirePair && matchesToFind > 0 && hasShuffled) {
      numValidPairs = this.numValidPairs();
      if (numValidPairs == 0) {
        this.shuffle(tiles, requirePair);
      }
    }
  };

  this.update = function(time) {
    var updateTileIndexes = [];
    for (var i = numTiles - 1; i >= 0; i--) {
      if (!tiles[i]) {
        continue;
      }

      tiles[i].update(time);
      if (tiles[i].readyToRemove) {
        tiles[i] = false;
        updateTileIndexes.push(i);
      }
    }

    if (matchesToFind > 0 && updateTileIndexes.length > 0) {
      this.updateGravity(updateTileIndexes);
      if (numValidPairs == 0) {
//        console.log('shuffle? pairs', numValidPairs, 'matches to find', matchesToFind);
        this.shuffle(tiles, true);
      }
    }
  };

  this.updateGravity = function(updateTileIndexes) {
    if (!gameMode.gravityType || updateTileIndexes.length <= 0) {
      return false;
    }

    switch (gameMode.gravityType) {
      case GRAVITY_DOWN:
        this.updateGravityDown(updateTileIndexes);
        break;
    }
  };

  this.updateGravityDown = function(tileIndexes) {
    var i;

    var cols = [];

    for (i = 0; i < tileIndexes.length; i++) {
      cols.push(this.indexToCol(tileIndexes[i], GRID_COLS));
    }
    cols = cols.unique();

    for (i = 0; i < cols.length; i++) {
//      console.log('-----------------------');
      var col = cols[i];
      var moveRows = 1;
      for (var row = GRID_ROWS - 2; row >= 0; row--) {
        // Skip if this position does not have a tile
        if (!this.isActiveTileAt(col, row)) {
          continue;
        }

        // Skip if the next position has a tile
        if (this.isActiveTileAt(col, row + 1)) {
          continue;
        }

        // Move tile 1 or 2 tiles down
        if (row + 2 < GRID_ROWS && !this.isActiveTileAt(col, row + 2)) {
          moveRows = 2;
        }

//        console.log('moveRows', moveRows, 'for', col, row);
        var oldIndex = this.tileToIndex(col, row);
        var newIndex = this.tileToIndex(col, row + moveRows);
        tiles[newIndex] = tiles[oldIndex];
        tiles[newIndex].placeAtIndex(newIndex);
        tiles.splice(oldIndex, 1, false);
      }

      if (0 < numExtraRemaining) {
        var addExtra = 1;
        if (!this.isActiveTileAt(col, 1)) {
          addExtra = 2;
        }

        // Add extra tiles
        var newTileIndex = col + GRID_COLS * (addExtra - 1);
//        console.log('Add num extras', addExtra, 'on col', col, 'starting at', newTileIndex);
        for (var e = col; e < extraTiles.length; e += GRID_COLS) {
          if (extraTiles[e]) {
//            console.log('add extra', newTileIndex, 'from', e);
            tiles[newTileIndex] = extraTiles[e];
            tiles[newTileIndex].placeAtIndex(newTileIndex);
            extraTiles.splice(e, 1, false);
            newTileIndex -= GRID_COLS;
            addExtra--;
            numExtraRemaining--;
          }

          if (addExtra <= 0) {
            break;
          }
        }
      }
    }
  };

  this.draw = function(time) {
    for (var i = 0; i < numTiles; i++) {
      if (tiles[i]) {
        tiles[i].draw(time);
      }
    }

    gameContext.font = gameFontSmall;
    gameContext.textAlign = 'right';
    drawText(gameContext, 180, 10, fontColor, 'Valid pairs');
    drawText(gameContext, 180, 30, fontColor, 'Tiles remaining');
    drawText(gameContext, 220, 10, fontColor, numValidPairs);
    drawText(gameContext, 220, 30, fontColor, numTilesRemaining);
  };

  this.touch = function(x, y) {
    var index = this.coordsToArrayIndex(x, y);
    if (index >= 0 && tiles[index]) {
      this._touch(tiles[index]);
    }
  };

  this.removeTile = function(i) {
    if (!DEBUG || !tiles[i]) {
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

        Particles.spawn(ParticleLightning, path);

        resetTouchedTiles();
        matchesToFind--;
        numTilesRemaining -= 2;
        numValidPairs = this.numValidPairs();
        if (matchesToFind == 0) {
          setTimeout(function() {
            isActive = false;
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

  this.hasHintsRemaining = function() {
    return 0 < numHints || DEBUG;
  };

  this.showHint = function() {
    if (!this.hasHintsRemaining()) {
      return;
    }
    numHints--;

    var pairs = this.getValidPairs();
    if (pairs.length == 0) {
      return;
    }

    var pair = pairs[Math.floor(Math.random() * pairs.length)];
    tiles[pair[0]].hint();
    tiles[pair[1]].hint();
  };

  this.removeValidPair = function() {
    // Debug function only!
    if (!DEBUG) {
      return;
    }

    var pairs = this.getValidPairs();
    if (pairs.length == 0) {
      return;
    }

    var pair = pairs[Math.floor(Math.random() * pairs.length)];
    tile1 = tiles[pair[0]];
    this._touch(tiles[pair[1]]);
  };

  this.getValidPairs = function() {
    var pairs = [];

    var tilesCopy = tiles.slice();
    for (var p1 = 0; p1 < tilesCopy.length - 1; p1++) {
      if (!tilesCopy[p1] || tilesCopy[p1].matching) {
        continue;
      }

      for (var p2 = p1 + 1; p2 < tilesCopy.length; p2++) {
        if (!tilesCopy[p2] || tilesCopy[p2].matching || tilesCopy[p1].index != tilesCopy[p2].index) {
          continue;
        }

        if (this.validPathBetweenTiles(tilesCopy[p1], tilesCopy[p2])) {
          pairs.push([p1, p2]);
        }
      }
    }


    return pairs;
  };

  this.numValidPairs = function() {
    return this.getValidPairs().length;
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

    while ((-1 < toCol && toCol < GRID_COLS) && (-1 < toRow && toRow < GRID_ROWS) && !this.isActiveTileAt(toCol + dCol, toRow + dRow)) {
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
        if (checkTile && !checkTile.matching && checkTile != tile1 && checkTile != tile2) {
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

  this.isActiveTileAt = function(col, row) {
    var tile = this.getTileAt(col, row);
    return tile && !tile.matching;
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
