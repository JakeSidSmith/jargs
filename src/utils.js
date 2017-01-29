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

  function validateName (name) {
    if (typeof name !== 'string') {
      throw new Error('Name must be a string');
    }

    if (!name) {
      throw new Error('Name cannot be falsey');
    }

    if (name.indexOf(' ') >= 0) {
      throw new Error('Name cannot contain spaces');
    }

    if (name.indexOf('-') === 0) {
      throw new Error('Name cannot begin with \'-\'');
    }
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
    validateName: validateName,
    find: find,
    each: each
  };

})();
