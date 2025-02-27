function setupInput() {
  drawCanvas.addEventListener('mousemove', updateMousePosition);
  drawCanvas.addEventListener('mousedown', clickOrTouch);
  drawCanvas.addEventListener('touchstart', clickOrTouch);
  document.addEventListener('keypress', keyPress);
}

function setMousePos(posX, posY) {
  var rect = drawCanvas.getBoundingClientRect();

  mouse = scaleCoordinates(posX - rect.left, posY - rect.top);

  mouse.button = -1;
}

function updateMousePosition(event) {
  setMousePos(event.clientX, event.clientY, event.button);
}

function clickOrTouch(event) {
  event.preventDefault();

  var x, y;

  if (event.targetTouches && event.targetTouches[0]) {
    x = event.targetTouches[0].pageX;
    y = event.targetTouches[0].pageY;
  }
  else {
    x = event.clientX;
    y = event.clientY;
  }

  setMousePos(x, y);
  if ((event.type == 'touchstart')) {
    // Left click
    mouse.button = 0;
  }
  else {
    mouse.button = event.button;
  }

  if (DEBUG && !Menu.isActive() && event.button == 1) {
    var i = Grid.coordsToArrayIndex(mouse.x, mouse.y);
    console.log('remove', i);
    Grid.removeTile(i);
  }
  else {
    Grid.touch(mouse.x, mouse.y);
  }
}

function keyPress(event) {
  if (event.keyCode == KEY_ESC) {
    if (Grid.isActive()) {
      Grid.pressEscape();
    }
    else if (EndGame.isActive()) {
      EndGame.pressEscape();
    }
    else if (Menu.isActive()) {
      Menu.pressEscape();
    }
  }
}

// Prevents player from drag selecting
document.onselectstart = function() {
  window.getSelection().removeAllRanges();
};
document.onmousedown = function() {
  window.getSelection().removeAllRanges();
};
document.oncontextmenu = function() {
  return false;
};
