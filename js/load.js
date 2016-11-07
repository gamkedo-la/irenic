var Images = new (function() {
  var images = {
    // key: 'img/image_name.png'
    tiles_classic: 'img/tiles-classic.png',
    tiles_classic_hover: 'img/tiles-classic-hover.png',
    tiles_classic_active: 'img/tiles-classic-active.png',

    tiles_numbers: 'img/tiles-numbers.png',
    tiles_numbers_hover: 'img/tiles-numbers-hover.png',
    tiles_numbers_active: 'img/tiles-numbers-active.png',

    tiles_crosspoint: 'img/tiles-crosspoint.png',
    tiles_crosspoint_hover: 'img/tiles-crosspoint-hover.png',
    tiles_crosspoint_active: 'img/tiles-crosspoint-active.png',

    tiles_hiragana: 'img/tiles-hiragana.png',
    tiles_hiragana_hover: 'img/tiles-hiragana-hover.png',
    tiles_hiragana_active: 'img/tiles-hiragana-active.png',

    background_classic: 'img/background-classic.png',
    background_crosspoint: 'img/background-crosspoint.png',

    button_sound_on: 'img/button-sound-on.png',
    button_sound_off: 'img/button-sound-off.png',
    button_timer_on: 'img/button-timer-on.png',
    button_timer_off: 'img/button-timer-off.png',

    button_x: 'img/button-x.png',
    button_hint_on: 'img/button-hint-on.png',
    button_hint_off: 'img/button-hint-off.png',
    button_shuffle_on: 'img/button-shuffle-on.png',
    button_shuffle_off: 'img/button-shuffle-off.png',

    button_classic: 'img/button-classic.png',
    button_numbers: 'img/button-numbers.png',
    button_crosspoint: 'img/button-crosspoint.png',
    button_hiragana: 'img/button-hiragana.png',

    tutorial_1: 'img/tutorial-straight.png',
    tutorial_2: 'img/tutorial-adjacent.png',
    tutorial_3: 'img/tutorial-1-corner.png',
    tutorial_4: 'img/tutorial-2-corners.png',
    tutorial_5: 'img/tutorial-2-corners-outside.png'
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
  this.audioFormat = '.mp3';
  var audio = new Audio();
  if (audio.canPlayType('audio/ogg')) {
    this.audioFormat = '.ogg';
  }

  var sounds = {
    // key_theme: 'sfx/file_name'
    matched_pair_classic: 'audio/Gong',
    matched_pair_numbers: 'audio/Bamboo',
    matched_pair_crosspoint: 'audio/Oriental'
  };

  this.initialize = function(callback) {
    var numToLoad = Object.keys(sounds).length;
    if (numToLoad == 0 && callback) {
      callback();
      return;
    }
    for (var key in sounds) {
      if (sounds.hasOwnProperty(key)) {
        this[key] = new Sound(sounds[key] + this.audioFormat, doneLoading);
      }
    }

    function doneLoading(event) {
      if (event) {
        // Remove event-listener so it only fires once!
        event.target.removeEventListener(event.type, arguments.callee);
      }
      numToLoad--;
      if (numToLoad <= 0 && callback) {
        callback();
      }
    }
  };

  this.play = function(sound) {
    sound += '_' + settings['theme'];
    if (this[sound]) {
      this[sound].play();
    }
  };

  var Sound = function(_file, callback) {
    var timeOut = 8;
    var lastPlay = 0;
    var numSounds = 5;
    var index = 0;
    var file = new Audio(_file);
    file.addEventListener('canplaythrough', callback);
    file.load();
    var queue = [file];

    for (var i = 1; i < numSounds; i++) {
      queue[i] = queue[0].cloneNode(false);
    }

    this.play = function() {
      if (!settings.sound) {
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
