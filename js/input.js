function setupInput() {
  gameCanvas.addEventListener('mousemove', this.updateMousePosition);
  gameCanvas.addEventListener('mousedown', this.clickOrTouch);
  gameCanvas.addEventListener('touchstart', this.clickOrTouch);
}

function setMousePos(posX, posY) {
  var rect = gameCanvas.getBoundingClientRect();
  var root = document.documentElement;

  mouse.x = posX - rect.left - root.scrollLeft;
  mouse.y = posY - rect.top - root.scrollTop;
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
