var EndGame = new (function() {
  var tweenBaseScore;
  var tweenBonus;
  var tweenMultiplier;
  var tweenScore;

  var tweenData = {
    baseScore: 0,
    bonus: 0,
    lengthMultiplier: 0.0,
    score: 0
  };

  var displayData = {
    baseScore: 0,
    bonus: 0,
    lengthMultiplier: 0.0,
    score: 0
  };

  var title;
  var isActive = false;
  var isInitialized = false;
  var buttonOk;

  var scoresY;
  var scoresTextX, scoresScoreX;
  var textBoxWidth, textBoxHeight;
  var titleX, titleY;

  this.initialize = function() {
    if (isInitialized) {
      return;
    }

    scoresTextX = 125;
    scoresScoreX = gameCanvas.width - 125;
    scoresY = 175;
    textBoxWidth = gameCanvas.width - 200;
    textBoxHeight = 20 + 7 * textLineHeight;
    titleX = gameCanvas.width / 2;
    titleY = 100 + textLineHeight;

    buttonOk = new ButtonText(100, 325, 'Ok', buttonOkCallback);

    tweenBaseScore = new TWEEN.Tween(tweenData)
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate(function() {
        displayData.baseScore = Math.round(tweenData.baseScore);
      });
    tweenBonus = new TWEEN.Tween(tweenData)
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate(function() {
        displayData.bonus = Math.round(tweenData.bonus);
      });
    tweenMultiplier = new TWEEN.Tween(tweenData)
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate(function() {
        displayData.lengthMultiplier = Math.round((tweenData.lengthMultiplier) * 100) / 100;
        displayData.lengthMultiplier = (displayData.lengthMultiplier + '00').substr(0, 4);
      });
    tweenScore = new TWEEN.Tween(tweenData)
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate(function() {
        displayData.score = Math.round(tweenData.score);
      });

    tweenBaseScore.chain(tweenBonus);
    tweenBonus.chain(tweenMultiplier);
    tweenMultiplier.chain(tweenScore);
  };

  this.activate = function(gameMode, score, numTilesRemaining, totalTiles, totalBaseScore, totalBonus, totalLengthMultiplier) {
    tweenBaseScore.stop().to({ baseScore: totalBaseScore }, 800);
    tweenBonus.stop().to({ bonus: totalBonus }, 800);
    tweenMultiplier.stop().to({ lengthMultiplier: Math.round((totalLengthMultiplier / (totalTiles / 2)) * 100) / 100 }, 800);
    tweenScore.stop().to({ score: score }, 1200);

    tweenBaseScore.start();
    // @todo time remaining?

    if (numTilesRemaining == 0) {
      title = 'You won!';
      Sounds.game_victory.play();
    }
    else {
      title = 'Oops! Game over...';
      Sounds.game_lost.play();
    }

    // Update hiscores
    var setting_name = 'hiscore_' + gameMode;
    if (!settings[setting_name]) {
      // Empty score, add first one!
      settings[setting_name] = [score];
    }
    else {
      settings[setting_name].push(score);
      settings[setting_name] = settings[setting_name].sort(sortHiscore).slice(0, NUM_HISCORE);
    }
    setSetting(setting_name, settings[setting_name]);

    Particles.clear();

    Grid.deactivate();
    isActive = true;
    MainLoop
      .stop()
      .setUpdate(this.update)
      .setDraw(this.draw)
      .start();
  };

  this.update = function(delta) {
    if (!isActive) {
      return;
    }

    buttonOk.update();
  };

  this.draw = function(interpolationPercentage) {
    if (!isActive) {
      return;
    }

    buttonOk.draw();
    _drawTextBoxBorder(gameContext, 100, 100, textBoxWidth, textBoxHeight, 16, 4, '#555', '#888');

    gameContext.font = gameFont;
    gameContext.textBaseline = 'middle';
    gameContext.textAlign = 'center';
    drawText(gameContext, titleX, titleY, fontColor, title);

    var lines = [];
    var scores = [];
    lines.push('Base score');
    scores.push(displayData.baseScore);
    lines.push('Bonus');
    scores.push(displayData.bonus);
    lines.push('Average Length Multiplier');
    scores.push(displayData.lengthMultiplier);

    for (var i = 0; i < lines.length; i++) {
      gameContext.textAlign = 'left';
      drawText(gameContext, scoresTextX, scoresY + i * textLineHeight, fontColor, lines[i]);
      gameContext.textAlign = 'right';
      drawText(gameContext, scoresScoreX, scoresY + i * textLineHeight, fontColor, scores[i]);
    }

    gameContext.textAlign = 'left';
    drawText(gameContext, scoresTextX, scoresY + 4 * textLineHeight, fontColor, 'Total');
    gameContext.textAlign = 'right';
    drawText(gameContext, scoresScoreX, scoresY + 4 * textLineHeight, fontColor, displayData.score);
  };

  this.isActive = function() {
    return isActive;
  };

  this.deactivate = function() {
    isActive = false;
  };

  this.pressEscape = function() {
    buttonOkCallback();
  };

  var buttonOkCallback = function() {
    isActive = false;
    Menu.activate();
  };

})();
