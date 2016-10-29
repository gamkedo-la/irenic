if (!Object.keys) {
  Object.keys = function(obj) {
    var arr = [],
      key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        arr.push(key);
      }
    }
    return arr;
  };
}

function isString(obj) {
  return (Object.prototype.toString.call(obj) === '[object String]');
}

function isArray(obj) {
  return (Object.prototype.toString.call(obj) === '[object Array]');
}

Array.prototype.unique = function() {
  var a = [];
  for (var i = 0, l = this.length; i < l; i++) {
    if (a.indexOf(this[i]) === -1) {
      a.push(this[i]);
    }
  }

  return a;
};

var fontHeightCache = [];
function determineFontHeight(font) {
  var result = fontHeightCache[font];

  if (!result) {
    var body = document.getElementsByTagName('body')[0];
    var dummy = document.createElement('div');

    var dummyText = document.createTextNode('(AbqMjgL');
    dummy.appendChild(dummyText);
    dummy.setAttribute('style', 'font:' + font + ';position:absolute;top:0;left:0;margin:0;padding:0');
    body.appendChild(dummy);
    result = dummy.offsetHeight;

    fontHeightCache[font] = result;
    body.removeChild(dummy);
  }

  return result;
}

function random(min, max, isFloat) {
  if (isFloat) {
    return Math.min(min + (Math.random() * (max - min + parseFloat('1e-' + ((Math.random() + '').length - 1)))), max);
  }

  return min + Math.floor(Math.random() * (max - min + 1));
}
