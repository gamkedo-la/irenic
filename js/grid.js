var Grid = new (function() {
  var numTiles = GRID_ROWS * GRID_COLS;
  var tile1, tile2;
  var numValidPairs = 0;
  var numTilesRemaining = 0;
  var numExtraRemaining = 0;
  var matchesToFind = 0;
  var numHints = 0;
  var numShuffles = 0;
  var tiles = [];
  var extraTiles = [];
  var gameModeKey;
  var gameMode;
  var isActive = false;
  var isPaused = false;
  var canvasCenter, textBoxWidth, textBoxHeight;
  var buttonResume, buttonQuit;
  var timeRemaining;
  var scoreDisplay = 0;
  var score = 0;
  var scoreType1, scoreType2;
  var tweenAddScore;
  var tweenDataScore = {
    score: 0
  };

  var totalTiles = 0;
  var totalBaseScore = 0;
  var totalBonus = 0;
  var totalLengthMultiplier = 0;

  var maxDistance = Math.sqrt(GRID_COLS * GRID_COLS + GRID_ROWS * GRID_ROWS) / 2;

  this.start = function(_gameMode) {
    Music.stop();
    Music.play('a');

    gameModeKey = _gameMode;
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
      if (tileTypes.indexOf(candidate) == -1) {
        tileTypes.push(candidate);
      }
    }

    tiles = this.generateTiles(numTiles, tileTypes);

    extraTiles = [];
    if (gameMode.extraTileCols && gameMode.extraTileRows) {
      extraTiles = this.generateTiles(gameMode.extraTileRows * gameMode.extraTileCols, tileTypes);
    }

    numExtraRemaining = extraTiles.length;
    numTilesRemaining = tiles.length + extraTiles.length;
    matchesToFind = (numTilesRemaining) / 2;
    numHints = gameMode.numHints;
    numShuffles = gameMode.numShuffles;

    timeRemaining = gameMode.timeTotal;
    scoreDisplay = 0;
    score = 0;
    tweenDataScore.score = 0;
    tweenAddScore = new TWEEN.Tween(tweenDataScore)
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate(function() {
        scoreDisplay = Math.round(tweenDataScore.score);
      });

    this.shuffleAll(tiles, true);
    if (gameMode.extraTileRows) {
      this.shuffleAll(extraTiles, false);
    }

    isActive = true;
    isPaused = false;

    if (!buttonQuit) {
      textBoxWidth = gameCanvas.width - 200;
      textBoxHeight = 20 + 2 * textLineHeight;
      canvasCenter = gameCanvas.width / 2;

      buttonResume = new ButtonText(canvasCenter - 225, textBoxHeight + 125, 'Resume', buttonResumeCallback);
      buttonQuit = new ButtonText(canvasCenter + 25, textBoxHeight + 125, 'Quit', buttonQuitCallback);
    }
  };

  var addScore = function(tile1, tile2) {
    var baseAmount = 25;
    var amount = baseAmount;
    var bonus = 0;

    totalTiles += 2;
    totalBaseScore += amount;

    if (scoreType1 == tile1.tileType) {
      bonus = 10;

      if (scoreType2 == tile1.tileType) {
        bonus = 20;
      }
    }
    amount += bonus;
    totalBonus += bonus;

    scoreType2 = scoreType1;
    scoreType1 = tile1.tileType;

    // Distance modifier: quadratic range between 1 and 2
    var vx = tile1.col - tile2.col;
    var vy = tile1.row - tile2.row;
    var distance = Math.sqrt(vx * vx + vy * vy);
    var multiplier = (1 + Math.floor(Math.pow(distance / maxDistance, 2) * 10) / 10);
    totalLengthMultiplier += multiplier;
    amount *= multiplier;

    score += Math.floor(amount);
    tweenAddScore.stop().to({ score: score }, 1300).start();

    return {
      score: baseAmount,
      bonus: bonus,
      multiplier: Math.round(multiplier * 100) / 100
    };
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
    if (numCandidates < 2) {
      numCandidates = 2;
    }
    for (var n = 0; n < tileTypes.length && result.length < amount; n++) {
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

  this._shuffle = function(shuffleTiles, requirePair) {
    if (shuffleTiles == undefined) {
      shuffleTiles = tiles;
    }
    if (requirePair == undefined) {
      requirePair = true;
    }

    var indexes = [];
    var i;

    for (i = 0; i < shuffleTiles.length; i++) {
      if (!shuffleTiles[i] || shuffleTiles[i].isMatched()) {
        continue;
      }
      indexes.push(i);
    }
    var randomIndexes = Randomizer.antisort(indexes, []);
    var randomDestinations = Randomizer.antisort(indexes, []);
    var temp;

    // Grab between 20 and 50 % of the tiles and swap those
    var grabPercentage = .2 + Randomizer.f24() * .3;
    var maxNum = Math.floor(grabPercentage * randomIndexes.length);

    for (i = 0; i < maxNum; i++) {
      temp = shuffleTiles[randomDestinations[i]];
      temp.placeAtIndex(randomIndexes[i]);

      shuffleTiles[randomDestinations[i]] = shuffleTiles[randomIndexes[i]];
      shuffleTiles[randomDestinations[i]].placeAtIndex(randomDestinations[i]);

      shuffleTiles[randomIndexes[i]] = temp;
    }

    if (requirePair) {
      numValidPairs = this.numValidPairs();
      if (numValidPairs == 0) {
        this._shuffle(shuffleTiles, requirePair);
      }
    }
  };

  this.shuffleAll = function(shuffleTiles, requirePair) {
    var i = shuffleTiles.length, j, temp;
    while (i--) {
      j = Math.floor((i + 1) * Math.random());
      temp = shuffleTiles[j];
      shuffleTiles[j] = shuffleTiles[i];
      shuffleTiles[j].placeAtIndex(j);
      shuffleTiles[i] = temp;
      shuffleTiles[i].placeAtIndex(i);
    }

    if (requirePair) {
      numValidPairs = this.numValidPairs();
      if (numValidPairs == 0) {
        this._shuffle(shuffleTiles, requirePair);
      }
      Sounds.play('shuffle');
      this.animateTiles();
    }
  };

  this.shuffle = function(shuffleTiles, requirePair) {
    this._shuffle(shuffleTiles, requirePair);
    if (requirePair) {
      Sounds.play('shuffle');
      this.animateTiles();
    }
  };

  this.animateTiles = function() {
    for (var i = numTiles; i >= 0; i--) {
      if (tiles[i] && !tiles[i].isMatched()) {
        tiles[i].moveIntoPosition();
      }
    }
  };

  this.update = function(delta) {
    if (!isActive) {
      return;
    }

    if (isPaused) {
      buttonResume.update();
      buttonQuit.update();
      return;
    }

    if (settings.timer) {
      timeRemaining -= delta;
      if (timeRemaining <= 0) {
        isActive = false;
        EndGame.activate(gameModeKey, score, numTilesRemaining, totalTiles, totalBaseScore, totalBonus, totalLengthMultiplier);
      }
    }

    var updateTileIndexes = [];
    for (var i = numTiles - 1; i >= 0; i--) {
      if (!tiles[i]) {
        continue;
      }

      tiles[i].update(delta);
      if (tiles[i].readyToRemove) {
        tiles[i] = false;
        updateTileIndexes.push(i);
      }
    }

    if (matchesToFind > 0 && updateTileIndexes.length > 0) {
      this.updateGravity(updateTileIndexes);
      numValidPairs = this.numValidPairs();
      if (numValidPairs == 0) {
        this.shuffle(tiles, true);
      }
    }
  };

  this.updateGravity = function(updateTileIndexes) {
    if (!gameMode.gravityType || updateTileIndexes.length <= 0) {
      return false;
    }

    var gravityType = gameMode.gravityType;
    if (gravityType == GRAVITY_FUNKY) {
      gravityType = gravityTypes[Math.floor(Math.random() * gravityTypes.length)];
    }

    switch (gravityType) {
      case GRAVITY_DOWN:
        this.updateGravityDown(updateTileIndexes);
        break;
      case GRAVITY_SIDES:
        this.updateGravitySides(updateTileIndexes);
        break;
    }
  };

  this.updateGravitySides = function(tileIndexes) {
    var centerCol = Math.floor(GRID_COLS / 2);
    var i;

    var tileCoords = [];

    for (i = 0; i < tileIndexes.length; i++) {
      tileCoords.push({
        col: this.indexToCol(tileIndexes[i]),
        row: this.indexToRow(tileIndexes[i])
      });
    }

    tileCoords.sort(function(a, b) {
      if (a.row == b.row) {
        if (a.col < centerCol && b.col < centerCol) {
          return a.col - b.col;
        }
        if (centerCol <= a.col && centerCol <= b.col) {
          return b.col - a.col;
        }
      }

      return 0;
    });

    for (i = 0; i < tileCoords.length; i++) {
      this._updateGravitySide(tileCoords[i].col, tileCoords[i].row);
    }
  };

  this._updateGravitySide = function(col, row) {
    var centerCol = Math.floor(GRID_COLS / 2);
    var dCol = -1;
    var stopCol = centerCol - 1;
    if (col < centerCol) {
      dCol = 1;
      stopCol = centerCol;
    }

    for (var i = col; i != stopCol; i += dCol) {
      var index = this.tileToIndex(i, row);
      var indexTo = this.tileToIndex(i - dCol, row);
      if (tiles[index] && !tiles[index].isMatched()) {
        tiles[indexTo] = tiles[index];
        tiles[indexTo].placeAtIndex(indexTo);
        tiles[index].moveIntoPosition();
        tiles.splice(index, 1, false);
      }
    }

    // Add extra tile for this row
    for (var e = row; e < extraTiles.length; e += GRID_ROWS) {
      if (extraTiles[e]) {
        tiles[index] = extraTiles[e];
        tiles[index].placeAtIndex(index);
        tiles[index].moveIntoPosition(200);
        extraTiles.splice(e, 1, false);
        numExtraRemaining--;
        break;
      }
    }
  };

  this.updateGravityDown = function(tileIndexes) {
    var i;

    var cols = [];

    for (i = 0; i < tileIndexes.length; i++) {
      cols.push(this.indexToCol(tileIndexes[i]));
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
        tiles[newIndex].moveIntoPosition();
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
            tiles[newTileIndex].moveIntoPosition(200);
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
    setShadow('#333', 10);
    gameContext.font = gameFontSmall;
    gameContext.textAlign = 'right';
    drawText(gameContext, 180, 10, fontColor, 'Tiles remaining');
    drawText(gameContext, 260, 10, fontColor, numTilesRemaining);
    drawText(gameContext, 180, 30, fontColor, 'Valid pairs');
    drawText(gameContext, 260, 30, fontColor, numValidPairs);
    drawText(gameContext, 180, 50, fontColor, 'Score');
    drawText(gameContext, 260, 50, fontColor, scoreDisplay);

    gameContext.textBaseline = 'top';
    gameContext.textAlign = 'center';
    drawText(gameContext, canvasCenter, 50, fontColor, gameMode.label);
    resetShadow();

    if (isPaused) {
      // @todo draw pause menu
      _drawTextBoxBorder(gameContext, 100, 100, textBoxWidth, textBoxHeight, cornerSizeBig, lineWidth, fillStyle, strokeStyle);
      drawText(gameContext, canvasCenter, 100 + textLineHeight, fontColor, 'Quit to menu?');
      buttonResume.draw();
      buttonQuit.draw();
      return;
    }

    if (settings.timer) {
      setShadow('#333', 8);
      drawStrokeRect(gameContext, 479, 54, 202, 12, fontColor, 1);
      drawFillRect(gameContext, 480, 55, Math.round(200 * timeRemaining / gameMode.timeTotal), 10, fontColor);
      resetShadow();
    }

    for (var i = 0; i < numTiles; i++) {
      if (tiles[i]) {
        tiles[i].draw(time);
      }
    }
  };

  var buttonResumeCallback = function() {
    isPaused = false;
  };

  var buttonQuitCallback = function() {
    Menu.activate();
  };

  this.touch = function(x, y) {
    if (!isActive || isPaused) {
      return;
    }

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
      Sounds.play('select');
    }
    else if (!tile2 && tile == tile1) {
      Sounds.play('select');
      resetTouchedTiles();
    }
    else if (!tile2) {
      tile2 = tile;
      tile2.active = true;

      if (tile1.tileType == tile2.tileType && (path = this.validPathBetweenTiles(tile1, tile2))) {
        Sounds.play('matched_pair');

        var particleScore = addScore(tile1, tile2);

        if (settings.timer) {
          timeRemaining = Math.min(gameMode.timeTotal, timeRemaining + gameMode.timeStep);
        }

        tile1.match();
        tile2.match();

        Particles.spawn(ParticleRemovePair, tile1.tileType, tile1.coords(), tile2.coords(), particleScore);

        Particles.spawn(ParticleLightning, path);

        resetTouchedTiles();
        matchesToFind--;
        numTilesRemaining -= 2;
        if (matchesToFind == 0) {
          setTimeout(function() {
            isActive = false;
            EndGame.activate(gameModeKey, score, numTilesRemaining, totalTiles, totalBaseScore, totalBonus, totalLengthMultiplier);
          }, TIMEOUT_WON_GAME);
        }
      }
      else {
        // @todo shake 'm
        Sounds.play('wrong_pair');
        tile1.active = false;
        tile1 = tile;
        tile2 = false;
      }
    }
  };

  this.debugTiles = function() {
    for (var i = 0; i < tiles.length; i++) {
      console.log('tile', i, tiles[i].tileType);
    }

    var pairs = this.getValidPairs();
    for (var p = 0; p < pairs.length; p++) {
      console.log('pair', p, tiles[pairs[p][0]].tileType, tiles[pairs[p][1]].tileType, this.validPathBetweenTiles(tiles[pairs[p][0]], tiles[pairs[p][1]]));
    }
  };

  this.hasShufflesRemaining = function() {
    return 0 < numShuffles || DEBUG;
  };

  this.shuffleTiles = function() {
    if (!this.hasShufflesRemaining()) {
      return;
    }
    numShuffles--;

    this.shuffle(tiles, true);
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

    Sounds.play('hint');
  };

  this.pressEscape = function() {
    if (!isActive) {
      return;
    }

    isPaused = true;
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

    for (var p1 = 0; p1 < tiles.length - 1; p1++) {
      if (!tiles[p1] || tiles[p1].isMatched()) {
        continue;
      }

      for (var p2 = p1 + 1; p2 < tiles.length; p2++) {
        if (!tiles[p2] || tiles[p2].isMatched() || tiles[p1].tileType != tiles[p2].tileType) {
          continue;
        }

        if (this.validPathBetweenTiles(tiles[p1], tiles[p2])) {
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
//      Particles.spawn(ParticleLine, tile1Lines[l], '#f00');
//    }
//    for (l = 0; l < tile2Lines.length; l++) {
//      Particles.spawn( ParticleLine, tile2Lines[l], '#00f');
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
        if (checkTile && !checkTile.isMatched() && checkTile != tile1 && checkTile != tile2) {
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
    return tile && !tile.isMatched();
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
    if (num_cols == undefined) {
      num_cols = GRID_COLS;
    }
    return index - (this.indexToRow(index, num_cols) * num_cols);
  };

  this.indexToRow = function(index, num_cols) {
    if (num_cols == undefined) {
      num_cols = GRID_COLS;
    }
    return Math.floor(index / num_cols);
  };

  this.tileToIndex = function(col, row) {
    return (col + GRID_COLS * row);
  };

})();
