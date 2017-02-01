'use strict';

(function () {

  function argsToArray (args) {
    return Array.prototype.slice.call(args);
  }

  function getNodeProperties (args, getChildren) {
    var argsArray = argsToArray(args);
    var name = argsArray.shift();
    var options = argsArray.shift() || {};

    var properties = {
      name: name,
      options: options
    };

    if (getChildren) {
      properties.children = argsArray;
    }

    return properties;
  }

  function validateName (name) {
    if (typeof name !== 'string') {
      throw new Error('Names and aliases must be a string');
    }

    if (!name) {
      throw new Error('Names and aliases cannot be empty');
    }

    if (name.indexOf(' ') >= 0) {
      throw new Error('Names and aliases cannot contain spaces');
    }

    if (name.indexOf('-') === 0) {
      throw new Error('Names and aliases cannot begin with \'-\'');
    }
  }

  function serializeOptions (options, validOptions) {
    for (var key in options) {
      var option = options[key];

      if (!(key in validOptions)) {
        throw new Error('Invalid option \'' + key + '\'');
      }

      if (key === 'alias') {
        validateName(option);
      }

      var valid = validOptions[key];

      if (
        (valid.type === 'string' && typeof option !== 'string') ||
        (valid.type === 'number' && typeof option !== 'number') ||
        (valid.type === 'object' && (typeof option !== 'object' || option === null)) ||
        (valid.type === 'array' && !Array.isArray(option)) ||
        (valid.type === 'boolean' && typeof option !== 'boolean')
      ) {
        throw new Error('Option ' + key + ' must be of type ' + valid.type);
      }
    }
  }

  function throwError (error) {
    process.stderr.write(error + '\n\n');
    process.exit(1);
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
    serializeOptions: serializeOptions,
    throwError: throwError,
    find: find,
    each: each
  };

})();
