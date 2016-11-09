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

if (!console) {
  var console = {};
}
if (!console.log) {
  console.log = function() {};
}

function createObjectFrom(constructorName) {
  var args = Array.prototype.slice.call(arguments, 1);
  var newObject = Object.create(constructorName.prototype);
  var constructorReturn = constructorName.apply(newObject, args);

  return (constructorReturn !== undefined) ? constructorReturn : newObject;
}

function isString(obj) {
  return (Object.prototype.toString.call(obj) === '[object String]');
}

function isArray(obj) {
  return (Object.prototype.toString.call(obj) === '[object Array]');
}

function sortHiscore(a, b) {
  return b - a;
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

function random(min, max, isFloat) {
  if (isFloat) {
    return Math.min(min + (Math.random() * (max - min + parseFloat('1e-' + ((Math.random() + '').length - 1)))), max);
  }

  return min + Math.floor(Math.random() * (max - min + 1));
}
