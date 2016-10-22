function setupInput() {
  drawCanvas.addEventListener('mousemove', this.updateMousePosition);
  drawCanvas.addEventListener('mousedown', this.clickOrTouch);
  drawCanvas.addEventListener('touchstart', this.clickOrTouch);
}

function setMousePos(posX, posY) {
  var rect = drawCanvas.getBoundingClientRect();

  mouse = scaleCoordinates(posX - rect.left, posY - rect.top);
}

function updateMousePosition(event) {
  setMousePos(event.clientX, event.clientY);
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

  if (debug && event.button == 1) {
    var i = Grid.coordsToArrayIndex(mouse.x, mouse.y);
    console.log('remove', i);
    Grid.removeTile(i);
  }
  else {
    Grid.touch(mouse.x, mouse.y);
  }
}

// Prevents player from drag selecting
document.onselectstart = function() {
  window.getSelection().removeAllRanges();
};
document.onmousedown = function() {
  window.getSelection().removeAllRanges();
};
