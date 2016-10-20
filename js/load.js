var Images = new (function() {
  var images = {
    // key: 'img/image_name.png'
    tiles: 'img/tiles.png',
    tiles_hover: 'img/tiles_hover.png',
    tiles_active: 'img/tiles_active.png'
  };

  this.initialize = function(callback) {
    var numToLoad = Object.keys(images).length;

    for (var key in images) {
      if (images.hasOwnProperty(key)) {
        this[key] = loadImage(images[key]);
      }
    }

    function loadImage(src) {
      var img = document.createElement('img');
      img.onload = doneLoading;
      img.src = src;

      return img;
    }

    function doneLoading() {
      numToLoad--;
      if (numToLoad == 0) {
        callback();
      }
    }

    return this;
  }
})();

var Sounds = new (function() {
  this.muted = false;

  this.audioFormat = '.mp3';
  var audio = new Audio();
  if (audio.canPlayType('audio/ogg')) {
    this.audioFormat = '.ogg';
  }

  var sounds = {
    // key: 'sfx/file_name'
  };

  this.initialize = function(callback) {
    var numToLoad = Object.keys(sounds).length;
    for (var key in sounds) {
      if (sounds.hasOwnProperty(key)) {
        this[key] = new Sound(sounds[key] + this.audioFormat, doneLoading);
      }
    }

    function doneLoading() {
      numToLoad--;
      if (numToLoad == 0) {
        callback();
      }
    }
  };

  var Sound = function(_file, callback) {
    var timeOut = 8;
    var lastPlay = 0;
    var numSounds = 5;
    var index = 0;
    var file = new Audio(_file);
    file.addEventListener('canplaythrough', callback);
    var queue = [file];

    for (var i = 1; i < numSounds; i++) {
      queue[i] = queue[0].cloneNode(false);
    }

    this.play = function() {
      if (Sounds.muted) {
        return;
      }
      if (Date.now() - lastPlay > timeOut) {
        lastPlay = Date.now();
        queue[index].currentTime = 0;
        queue[index].play();
        var s = queue[index];

        index++;
        if (index >= numSounds) {
          index = 0;
        }

        return s;
      }
    };
  };
})();
