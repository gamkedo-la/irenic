var Buttons = new (function() {
  var buttons = [];

  this.initialize = function() {
    buttons.push(new ButtonSetting(588, 0, 'sound', true, Images.button_sound_on, Images.button_sound_off, buttonToggleSetting));
    buttons.push(new ButtonSetting(638, 0, 'timer', true, Images.button_timer_on, Images.button_timer_off, buttonToggleSetting, menuIsActive));
    buttons.push(new Button(538, 0, Images.button_hint_on, buttonHint, hasHintsRemaining));
    buttons.push(new Button(538, 0, Images.button_hint_off, false, noHintsRemaining));
    buttons.push(new Button(488, 0, Images.button_shuffle_on, buttonShuffle, hasShufflesRemaining));
    buttons.push(new Button(488, 0, Images.button_shuffle_off, false, noShufflesRemaining));
    buttons.push(new Button(638, 0, Images.button_x, buttonQuit, gameIsActive));
  };

  this.update = function() {
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].update();
    }
  };

  this.draw = function() {
    setShadow('#333', 10);
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].draw();
    }
    resetShadow();
  };

  var buttonToggleSetting = function(setting) {
    setSetting(setting, !settings[setting]);
  };

  var buttonQuit = function() {
    Grid.pressEscape();
  };

  var buttonHint = function() {
    return Grid.showHint();
  };

  var buttonShuffle = function() {
    return Grid.shuffleTiles();
  };

  var menuIsActive = function() {
    return Menu.isActive();
  };

  var hasHintsRemaining = function() {
    return gameIsActive() && Grid.hasHintsRemaining();
  };

  var noHintsRemaining = function() {
    return gameIsActive() && !Grid.hasHintsRemaining();
  };

  var hasShufflesRemaining = function() {
    return gameIsActive() && Grid.hasShufflesRemaining();
  };

  var noShufflesRemaining = function() {
    return gameIsActive() && !Grid.hasShufflesRemaining();
  };

  var gameIsActive = function() {
    return Grid.isActive();
  };
})();

var Button = function(x, y, image, callback, showConditionCallback) {
  var width = image.width;
  var height = image.height;
  var button = new _Button(x, y, width, height, false, callback);

  this.update = function() {
    if (showConditionCallback && !showConditionCallback()) {
      return;
    }

    button.update();
  };

  this.draw = function() {
    if (showConditionCallback && !showConditionCallback()) {
      return;
    }

    drawBitmapCenteredWithScaleAndRotation(gameContext, image, x + (width / 2), y + (height / 2));
  };
};

var ButtonSetting = function(x, y, setting, onValue, imageOn, imageOff, callback, showConditionCallback) {
  var width = imageOn.width;
  var height = imageOn.height;
  var button = new _Button(x, y, width, height, false, callback, [setting, onValue]);

  this.update = function() {
    if (showConditionCallback && !showConditionCallback()) {
      return;
    }

    button.update();
  };

  this.draw = function() {
    if (showConditionCallback && !showConditionCallback()) {
      return;
    }

    var active = (settings[setting] == onValue);
    var image = (!imageOff || active) ? imageOn : imageOff;
    var scale = (!imageOff && !active) ? 0.7 : 1;
    drawBitmapCenteredWithScaleAndRotation(gameContext, image, x + (width / 2), y + (height / 2), scale);
  };
};
