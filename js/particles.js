var Particles = new (function() {
  var list = [];

  this.spawn = function(particleClass) {
    list.unshift(createObjectFrom.apply(null, arguments));
  };

  this.update = function(delta) {
    for (var i = list.length - 1; i >= 0; i--) {
      list[i].update(delta);
      if (list[i].readyToRemove) {
        list.splice(i, 1);
      }
    }
  };

  this.draw = function(interpolationPercentage) {
    for (var i = 0; i < list.length; i++) {
      list[i].draw(interpolationPercentage);
    }
  };

  this.clear = function() {
    list = [];
  };
})();

var ParticleLightning = function(points) {
  this.readyToRemove = false;
  var maxAge = 600;
  var age = 0;
  var alpha = 0;
  var alphaDelta = -0.002;

  var sway = 30;
  var jaggedness = 1 / sway;

  this.bolts = [];

  for (var i = 0; i < points.length; i++) {
    points[i].x = points[i].col * (TILE_WIDTH + TILE_GAP) + GRID_PADDING_WIDTH + Math.round(TILE_WIDTH / 2);
    points[i].y = points[i].row * (TILE_HEIGHT + TILE_GAP) + GRID_PADDING_HEIGHT + Math.round(TILE_HEIGHT / 2);
  }

  this.update = function(delta) {
    if (alpha <= 0.65) {
      alpha = random(0.8, 1.0, true);

      this.bolts = [[], []];
      for (var i = 1; i < points.length; i++) {
        for (var j = 0; j < this.bolts.length; j++) {
          this.makeBolt(this.bolts[j], points[i - 1], points[i], 2);
        }
      }
    }

    age += delta;
    alpha += alphaDelta * delta;
    this.readyToRemove = (maxAge <= age);
  };

  this.draw = function(interpolationPercentage) {
    gameContext.shadowOffsetX = 0;
    gameContext.shadowOffsetY = 0;
    gameContext.shadowBlur = 10;
    gameContext.shadowColor = '#fff';
    gameContext.globalAlpha = alpha;
    gameContext.strokeStyle = '#fff';
    gameContext.lineWidth = 2;

    for (var v = 0; v < this.bolts.length; v++) {
      gameContext.beginPath();
      gameContext.moveTo(this.bolts[v][0].x, this.bolts[v][0].y);
      for (var i = 0; i < this.bolts[v].length; i++) {
        gameContext.lineTo(this.bolts[v][i].x, this.bolts[v][i].y);
      }
      gameContext.stroke();
    }

    // Reset context-settings
    gameContext.globalAlpha = 1;
    gameContext.shadowBlur = 0;
  };

  this.makeBolt = function(results, source, dest, num_points) {
    if (results.length == 0) {
      results.push(source);
    }

    // Code adapted from:
    // https://gamedevelopment.tutsplus.com/tutorials/how-to-generate-shockingly-good-2d-lightning-effects--gamedev-2681

    var tangent = {
      x: dest.x - source.x,
      y: dest.y - source.y
    };
    var length = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y);
    var normal;
    if (length == 0) {
      normal = {
        x: 1,
        y: 0
      };
    }
    else {
      normal = {
        x: tangent.y / length,
        y: -tangent.x / length
      };
    }
    if (!num_points) {
      num_points = 4;
    }

    var positions = [0];
    for (var i = 0; i < length / num_points; i++) {
      positions.push(Math.random());
    }
    positions.sort();

    var prevDisplacement = 0;
    for (i = 1; i < positions.length; i++) {
      var pos = positions[i];

      var scale = (length * jaggedness) * (pos - positions[i - 1]);

      var envelope = (pos > 0.95) ? 20 * (1 - pos) : 1;

      var displacement = random(-sway, sway);
      displacement -= (displacement - prevDisplacement) * (1 - scale);
      displacement *= envelope;

      var point = {
        x: source.x + pos * tangent.x + displacement * normal.x,
        y: source.y + pos * tangent.y + displacement * normal.y
      };

      results.push(point);
      prevDisplacement = displacement;
    }

    results.push(dest);

    return results;
  };
};

var ParticleSmoke = function() {
  this.readyToRemove = true;

  var x = gameCanvas.width / 2;
  var y = GRID_PADDING_HEIGHT;

  var speedX = random(-1, 1, true);
  var speedY = random(-0.95, -1.05, true);
  var rotationSpeed = random(-0.05, 0.05, true);

  var age = random(REMOVE_SMOKE_TIME * 0.7, REMOVE_SMOKE_TIME, true);
  var scale = random(0.3, 0.6, true);
  var angle = random(-Math.PI, Math.PI, true);
  var alpha = random(0.7, 0.95, true);

  var speedDecay = 0.975;
  var scaleDecay = 1.02;
  var rotationDecay = 0.98;
  var alphaDecay = 0.95;

  this.update = function(delta) {
    age -= delta;
    this.readyToRemove = (age < 0);

    angle += rotationSpeed;
    x += speedX;
    y += speedY;

    speedX *= speedDecay;
    speedY *= speedDecay;

    rotationSpeed *= rotationDecay;
    scale *= scaleDecay;
    alpha *= alphaDecay;
  };

  this.draw = function() {
    drawBitmapCenteredWithScaleAndRotationAndAlpha(gameContext, Images.smoke, x, y, scale, angle, alpha);
  };
};

var ParticleRemovePair = function(tileType, p1, p2) {
  this.readyToRemove = false;
  var that = this;

  var halfWidth = TILE_WIDTH / 2;
  var halfHeight = TILE_HEIGHT / 2;
  var canvasHalfWidth = gameCanvas.width / 2;
  var canvasHalfHeight = gameCanvas.height / 2;

  var imageName = 'tiles_' + settings['theme'];
  var spriteCol = Grid.indexToCol(tileType, SPRITE_COLS);
  var spriteRow = Grid.indexToRow(tileType, SPRITE_COLS);
  var spriteX = spriteCol * TILE_WIDTH;
  var spriteY = spriteRow * TILE_HEIGHT;

  var leftPos = p1;
  var rightPos = p2;
  if (p1.x > p2.x) {
    leftPos = p2;
    rightPos = p1;
  }

  var leftXs = [
    leftPos.x,
    Math.max(0, leftPos.x - canvasHalfWidth),
    canvasHalfWidth - halfWidth - TILE_GAP / 2
  ];
  var leftYs = [
    leftPos.y,
    Math.max(GRID_PADDING_HEIGHT, leftPos.y - canvasHalfHeight),
    GRID_PADDING_HEIGHT
  ];
  var leftTo = {
    x: canvasHalfWidth - TILE_WIDTH * 3,
    y : GRID_PADDING_HEIGHT,
    alpha : 0.2
  };

  var rightXs = [
    rightPos.x,
    Math.min(gameCanvas.width, leftPos.x + canvasHalfWidth),
    canvasHalfWidth + halfWidth + TILE_GAP / 2
  ];
  var rightYs = [
    rightPos.y,
    Math.max(GRID_PADDING_HEIGHT, rightPos.y - canvasHalfHeight),
    GRID_PADDING_HEIGHT
  ];
  var rightTo = {
    x: canvasHalfWidth + TILE_WIDTH * 3,
    y : GRID_PADDING_HEIGHT,
    alpha : 0.2
  };

  var leftPositions = { x: leftPos.x, y: leftPos.y, alpha: 1 };
  var rightPositions = { x: rightPos.x, y: rightPos.y, alpha: 1 };

  var leftMove = new TWEEN.Tween(leftPositions).to(leftTo, REMOVE_MOVEMENT_TIME)
    .easing(TWEEN.Easing.Linear.None)
    .onStart(function() {
      var maxSmoke = random(2, 5);
      for (var i = 0; i < maxSmoke; i++) {
        Particles.spawn(ParticleSmoke);
      }
    })
    .onComplete(function() {
      that.readyToRemove = true;
    });

  new TWEEN.Tween(leftPositions).to({ x: leftXs, y: leftYs }, REMOVE_BOUNCE_TIME)
    .interpolation(TWEEN.Interpolation.Bezier)
    .easing(TWEEN.Easing.Linear.None)
    .chain(leftMove)
    .start();

  var rightMove = new TWEEN.Tween(rightPositions).to(rightTo, REMOVE_MOVEMENT_TIME)
    .easing(TWEEN.Easing.Linear.None);

  new TWEEN.Tween(rightPositions).to({ x: rightXs, y: rightYs }, REMOVE_BOUNCE_TIME)
    .interpolation(TWEEN.Interpolation.Bezier)
    .easing(TWEEN.Easing.Linear.None)
    .chain(rightMove)
    .start();

  this.update = function(time) {};

  this.draw = function() {
    gameContext.save();
    gameContext.globalAlpha = leftPositions.alpha;
    gameContext.drawImage(Images[imageName], spriteX, spriteY, TILE_WIDTH, TILE_HEIGHT, leftPositions.x - halfWidth, leftPositions.y - halfHeight, TILE_WIDTH, TILE_HEIGHT);
    gameContext.drawImage(Images[imageName], spriteX, spriteY, TILE_WIDTH, TILE_HEIGHT, rightPositions.x - halfWidth, rightPositions.y - halfHeight, TILE_WIDTH, TILE_HEIGHT);
    gameContext.globalAlpha = 1;
    gameContext.restore();
  };
};

var ParticleLine = function(points, color) {
  this.readyToRemove = false;

  var maxAge = 800;
  var age = 0;

  if (!color) {
    color = '#0f0';
  }
  for (var i = 0; i < points.length; i++) {
    points[i].x = points[i].col * (TILE_WIDTH + TILE_GAP) + GRID_PADDING_WIDTH + Math.round(TILE_WIDTH / 2);
    points[i].y = points[i].row * (TILE_HEIGHT + TILE_GAP) + GRID_PADDING_HEIGHT + Math.round(TILE_HEIGHT / 2);
  }

  this.update = function(delta) {
    age += delta;
    this.readyToRemove = (maxAge <= age);
  };

  this.draw = function(interpolationPercentage) {
    gameContext.beginPath();
    gameContext.moveTo(points[0].x, points[0].y);
    for (var i = 0; i < points.length; i++) {
      gameContext.lineTo(points[i].x, points[i].y);
    }
    gameContext.strokeStyle = color;
    gameContext.lineWidth = 5;
    gameContext.stroke();
  };
};
