'use strict';

(function () {

  var MATCHES_BAD_NAME_CHARS = /[^a-z0-9-]/i;

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
    } else if (argsArray.length) {
      throw new Error('Only commands can have children');
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

    if (MATCHES_BAD_NAME_CHARS.test(name)) {
      throw new Error('Names and aliases may only contain letters, numbers, and hyphens');
    }

    if (name.indexOf('-') === 0) {
      throw new Error('Names and aliases cannot begin with \'-\'');
    }
  }

  function serializeOptions (options, validOptions) {
    if (!(typeof options === 'undefined' || typeof options === 'object') || Array.isArray(options)) {
      throw new Error('Options must be an object');
    }

    if ('_type' in options) {
      throw new Error('It looks like you\'ve accidentally passed a node as another node\'s second argument (options)');
    }

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

    for (var validKey in validOptions) {
      var validOption = validOptions[validKey];

      if (('default' in validOption) && !(validKey in options)) {
        options[validKey] = validOption.default;
      }
    }
  }

  /* istanbul ignore next */
  function exitWithHelp (error) {
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
    exitWithHelp: exitWithHelp,
    find: find,
    each: each
  };

})();
