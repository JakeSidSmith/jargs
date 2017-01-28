'use strict';

(function () {

  function argsToArray (args) {
    return Array.prototype.slice.call(args);
  }

  function getNodeProperties (args) {
    var argsArray = argsToArray(args);
    var name = argsArray.shift();
    var options = argsArray.shift() || {};

    return {
      name: name,
      options: options,
      children: argsArray
    };
  }

  function find (arr, fn) {
    for (var i = 0; i < arr.length; i += 1) {
      if (fn(arr[i], i)) {
        return arr[i];
      }
    }

    return null;
  }

  function each (arr, fn) {
    for (var i = 0; i < arr.length; i += 1) {
      fn(arr[i], i);
    }
  }

  module.exports = {
    argsToArray: argsToArray,
    getNodeProperties: getNodeProperties,
    find: find,
    each: each
  };

})();
