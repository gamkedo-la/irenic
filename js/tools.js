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
