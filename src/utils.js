'use strict';

(function () {

  var MATCHES_LEADING_SPACES = /^\s+/;
  var MATCHES_TRAILING_SPACES = /\s+$/;
  var MATCHES_BAD_NAME_CHARS = /[^a-z0-9-]/i;

  var TABLE_OPTIONS = {
    indentation: '    ',
    margin: '  ',
    width: 80
  };

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

  function getMaxTableWidths (table) {
    var maxWidths = [];

    each(table, function (row) {
      each(row, function (cell, index) {
        if (typeof maxWidths[index] === 'undefined' || cell.length > maxWidths[index]) {
          maxWidths[index] = cell.length;
        }
      });
    });

    return maxWidths;
  }

  function getRemainingSpace (maxWidths, options) {
    var remainingSpace = TABLE_OPTIONS.width - TABLE_OPTIONS.indentation.length;

    each(maxWidths, function (value, index) {
      if (options.wrap.indexOf(index) < 0) {
        remainingSpace -= value;
      }

      if (index < maxWidths.length - 1) {
        remainingSpace -= TABLE_OPTIONS.margin.length;
      }
    });

    return remainingSpace;
  }

  function createSpaces (length) {
    var spaces = '';

    for (var i = 0; i < length; i += 1) {
      spaces += ' ';
    }

    return spaces;
  }

  function pad (str, length, right) {
    if (!right) {
      return (str + createSpaces(length)).substring(0, length);
    }

    return (createSpaces(length) + str).substring(str.length, str.length + length);
  }

  function createTable (table, options, maxWidths, remainingSpace) {
    var concat = '';

    each(table, function (row, rowIndex) {
      var currentConcat = TABLE_OPTIONS.indentation;
      var nextConcats = [];

      each(row, function (cell, index) {
        if (options.wrap.indexOf(index) < 0) {
          currentConcat += pad(
            cell,
            maxWidths[index],
            options.alignRight.indexOf(index) >= 0
          );
        } else {
          var wrappedText = cell.substring(remainingSpace);

          while (wrappedText.length) {
            nextConcats.push(createSpaces(currentConcat.length));

            nextConcats[nextConcats.length - 1] +=
              wrappedText.replace(MATCHES_LEADING_SPACES, '').substring(0, remainingSpace);

            wrappedText = wrappedText.substring(remainingSpace);
          }

          currentConcat += pad(
            cell.substring(0, remainingSpace),
            remainingSpace,
            options.alignRight.indexOf(index) >= 0
          );
        }

        if (index < row.length - 1) {
          currentConcat += TABLE_OPTIONS.margin;
        }
      });

      concat += currentConcat;

      each(nextConcats, function (nextConcat) {
        concat += '\n' + nextConcat;
      });

      if (rowIndex < table.length - 1) {
        concat += '\n';
      }
    });

    return concat.split('\n').map(function (line) {
      return line.replace(MATCHES_TRAILING_SPACES, '');
    }).join('\n');
  }

  function formatTable (table, options) {
    var maxWidths = getMaxTableWidths(table);
    var remainingSpace = getRemainingSpace(maxWidths, options);
    return createTable(table, options, maxWidths, remainingSpace);
  }

  function createCommandsText (commands) {
    return (commands.length ? '  Commands:\n' : '') +
      formatTable(commands.map(function (command) {
        var alias = (command.options.alias ? ', ' + command.options.alias : '');
        return [command.name + alias, command.options.description];
      }), {wrap: [1], alignRight: [2]}) +
      (commands.length ? '\n\n' : '');
  }

  function createOptionsText (options) {
    return (options.length ? '  Options:\n' : '') +
      formatTable(options.map(function (option) {
        var namePrefix = option._type === 'arg' ? '<' : '--';
        var nameSuffix = option._type === 'arg' ? '>' : '';
        var aliasPrefix = namePrefix.substring(0, 1);
        var alias = (option.options.alias ? ', ' + aliasPrefix + option.options.alias : '');
        var type = option.options.type ? '   [' + option.options.type + ']' : '';
        return [namePrefix + option.name + nameSuffix + alias, option.options.description, type];
      }), {wrap: [1], alignRight: [2]}) +
      (options.length ? '\n\n' : '');
  }

  function createExamplesText (examples) {
    return (examples.length ? '  Examples:\n' : '') +
      examples.map(function (example) {
        return '    ' + example;
      }).join('\n') +
      (examples.length ? '\n\n' : '');
  }

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

    return '\n' +
      (schema.options.usage ? '  Usage: ' + schema.options.usage + '\n\n' : '') +
      createCommandsText(commands) +
      createOptionsText(options) +
      createExamplesText(schema.options.examples) +
      '  ' + error + '\n\n';
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
    formatTable: formatTable,
    createHelp: createHelp,
    exitWithHelp: exitWithHelp
  };

})();
