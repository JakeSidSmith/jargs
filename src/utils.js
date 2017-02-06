'use strict';

(function () {

  var MATCHES_BAD_NAME_CHARS = /[^a-z0-9-]/i;

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
        (valid.type === 'boolean' && typeof option !== 'boolean') ||
        (valid.type === 'function' && typeof option !== 'function')
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

  /*
    Usage: program <command> [options]

    Commands:
      command  Do a thing

    Options:
      --help, -h     Show help                                             [boolean]
      --version, -v  Return the version number                             [boolean]

    Examples:
      program command --flag                                   (A brief description)

    Unknown argument: unknown
  */

  function createHelp (schema, error) {
    var commands = [];
    var options = [];

    each(schema.children, function (node) {
      if (node._type === 'command') {
        commands.push(node);
      } else {
        options.push(node);
      }
    });

    var usageText = (schema.options.usage ? '  Usage: ' + schema.options.usage + '\n\n' : '');

    var commandsText = (commands.length ? '  Commands:\n' : '') +
      commands.map(function (command) {
        var alias = (command.options.alias ? ', ' + command.options.alias : '');
        return '    ' + command.name + alias + '   ' + command.options.description;
      }).join('\n') +
      (commands.length ? '\n\n' : '');

    var optionsText = (options.length ? '  Options:\n' : '') +
      options.map(function (option) {
        var namePrefix = option._type !== 'arg' ? '--' : '';
        var aliasPrefix = namePrefix.substring(0, 1);
        var alias = (option.options.alias ? ', ' + aliasPrefix + option.options.alias : '');
        var type = option.options.type ? '   [' + option.options.type + ']' : '';
        return '    ' + namePrefix + option.name + alias + '   ' + option.options.description + type;
      }).join('\n') +
      (options.length ? '\n\n' : '');

    var examplesText = (schema.options.examples.length ? '  Examples:\n' : '') +
      schema.options.examples.map(function (example) {
        return '    ' + example;
      }).join('\n') +
      (schema.options.examples.length ? '\n\n' : '');

    var errorText = '  ' + error + '\n\n';

    return '\n' +
      usageText +
      commandsText +
      optionsText +
      examplesText +
      errorText;
  }

  /* istanbul ignore next */
  function exitWithHelp (help) {
    process.stderr.write(help);
    process.exit(1);
  }

  module.exports = {
    find: find,
    each: each,
    argsToArray: argsToArray,
    getNodeProperties: getNodeProperties,
    validateName: validateName,
    serializeOptions: serializeOptions,
    createHelp: createHelp,
    exitWithHelp: exitWithHelp
  };

})();
