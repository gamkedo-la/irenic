function setupInput() {
  drawCanvas.addEventListener('mousemove', this.updateMousePosition);
  drawCanvas.addEventListener('mousedown', this.clickOrTouch);
  drawCanvas.addEventListener('touchstart', this.clickOrTouch);
  document.addEventListener('keypress', keyPress);
}

function setMousePos(posX, posY, button) {
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

  if (debug && !Menu.isActive() && event.button == 1) {
    var i = Grid.coordsToArrayIndex(mouse.x, mouse.y);
    console.log('remove', i);
    Grid.removeTile(i);
  }
  else {
    Grid.touch(mouse.x, mouse.y);
  }
}

function keyPress(event) {
  if (!Menu.isActive() && event.keyCode == KEY_ESC) {
    Menu.activate();
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
