'use strict';

(function () {

  var MATCHES_LEADING_AND_TRAILING_SPACES = /(^\s+|\s+$)/;
  var MATCHES_TRAILING_SPACES = /\s+$/;
  var MATCHES_SPACE = /\s/;
  var MATCHES_BAD_NAME_CHARS = /[^a-z0-9-]/i;

  var MATCHES_ARG_TYPE = /\b(?:arg)\b/i;
  var MATCHES_KWARG_TYPE = /\b(kwarg|flag)\b/i;

  var VALID_CHILD_NODES = [
    'arg',
    'flag',
    'kwarg',
    'command',
    'require-any',
    'require-all',
    'required'
  ];

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

  function any (arr, fn) {
    for (var i = 0; i < arr.length; i += 1) {
      if (fn(arr[i], i)) {
        return true;
      }
    }

    return false;
  }

  function several (arr, fn) {
    var count = 0;

    for (var i = 0; i < arr.length; i += 1) {
      if (fn(arr[i], i)) {
        count += 1;
      }

      if (count > 1) {
        return true;
      }
    }

    return count > 1;
  }

  function sum (arr) {
    var total = 0;

    for (var i = 0; i < arr.length; i += 1) {
      total += arr[i];
    }

    return total;
  }

  function argsToArray (args) {
    return Array.prototype.slice.call(args);
  }

  function validateChildren (children, validTypes) {
    var argNames = [];
    var kwargNames = [];
    var kwargAliases = [];
    var otherNames = [];
    var otherAliases = [];

    each(children, function (node) {
      if (typeof node !== 'object') {
        throw new Error('Invalid child node of type ' + (typeof node));
      }

      if (validTypes.indexOf(node._type) < 0) {
        throw new Error('Invalid child node with type ' + node._type +
          '. Child nodes may only be ' + validTypes.join(', '));
      }

      if (node.name) {
        if (MATCHES_ARG_TYPE.test(node._type)) {
          if (argNames.indexOf(node.name) >= 0) {
            throw new Error('More than one node with the name "' + node.name + '" at the same level');
          }

          argNames.push(node.name);
        } else if (MATCHES_KWARG_TYPE.test(node._type)) {
          if (kwargNames.indexOf(node.name) >= 0) {
            throw new Error('More than one node with the name "' + node.name + '" at the same level');
          }

          kwargNames.push(node.name);
        } else {
          if (otherNames.indexOf(node.name) >= 0) {
            throw new Error('More than one node with the name "' + node.name + '" at the same level');
          }

          otherNames.push(node.name);
        }
      }

      if (node.options && node.options.alias) {
        if (MATCHES_KWARG_TYPE.test(node._type)) {
          if (kwargAliases.indexOf(node.options.alias) >= 0) {
            throw new Error('More than one node with the alias "' + node.options.alias + '" at the same level');
          }

          kwargAliases.push(node.options.alias);
        } else {
          if (otherAliases.indexOf(node.options.alias) >= 0) {
            throw new Error('More than one node with the alias "' + node.options.alias + '" at the same level');
          }

          otherAliases.push(node.options.alias);
        }
      }
    });
  }

  function getNodeProperties (args, getChildren) {
    var children = argsToArray(args);
    var name = children.shift();
    var options = children.shift() || {};

    var properties = {
      name: name,
      options: options
    };

    if (getChildren) {
      validateChildren(children, VALID_CHILD_NODES);

      properties._requireAll = [];
      properties._requireAny = [];
      properties.children = [];

      each(children, function (child) {
        switch (child._type) {
          case 'required':
          case 'require-all':
            properties._requireAll = properties._requireAll.concat(child.children);
            properties.children = properties.children.concat(child.children);
            break;
          case 'require-any':
            properties._requireAny.push(child.children);
            properties.children = properties.children.concat(child.children);
            break;
          default:
            properties.children = properties.children.concat(child);
            break;
        }
      });

      var moreThanOneCommand = several(properties._requireAll, function (child) {
        return child._type === 'command';
      });

      if (moreThanOneCommand) {
        throw new Error('More than one required Command at the same level. Use RequireAny');
      }
    } else if (children.length) {
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

      if (valid.length && option.length !== valid.length) {
        throw new Error('Option ' + key + ' must be of length ' + valid.length);
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

  function wrapText (text, availableSpace, currentConcat, nextConcats, alignRight) {
    var wrappedWords = text.split(MATCHES_SPACE);
    var wrappedLineIndex = 0;

    function indentLine (lineIndex) {
      if (typeof nextConcats[lineIndex] === 'undefined') {
        nextConcats[lineIndex] = createSpaces(currentConcat.length);
      } else {
        nextConcats[lineIndex] += TABLE_OPTIONS.margin;
      }
    }

    indentLine(wrappedLineIndex);

    each(wrappedWords, function (word, wordIndex) {
      if (word.length > availableSpace) {
        var hyphenatedWord = word;

        while (hyphenatedWord.length) {
          var withHyphen = availableSpace > 1 &&
            hyphenatedWord.charAt(availableSpace) !== '-' &&
            hyphenatedWord.length > availableSpace;

          nextConcats[wrappedLineIndex] += hyphenatedWord.substring(0, availableSpace - (withHyphen ? 1 : 0)) +
            (withHyphen ? '-' : '');
          hyphenatedWord = hyphenatedWord.substring(availableSpace - (withHyphen ? 1 : 0));

          if (hyphenatedWord.length) {
            wrappedLineIndex += 1;
            indentLine(wrappedLineIndex);
          }
        }
      } else if (nextConcats[wrappedLineIndex].length - currentConcat.length + word.length > availableSpace) {
        wrappedLineIndex += 1;
        indentLine(wrappedLineIndex);
        nextConcats[wrappedLineIndex] += word;
      } else {
        nextConcats[wrappedLineIndex] += word;
      }

      if (
        nextConcats[wrappedLineIndex].length < currentConcat.length + availableSpace &&
        wordIndex < wrappedWords.length - 1
      ) {
        nextConcats[wrappedLineIndex] += ' ';
      }
    });

    each(nextConcats, function (nextConcat, index) {
      nextConcats[index] = nextConcat.substring(0, currentConcat.length) +
        pad(
          nextConcat.substring(currentConcat.length).replace(MATCHES_LEADING_AND_TRAILING_SPACES, ''),
          availableSpace,
          alignRight
        );
    });
  }

  function mapCells (table, options, maxWidths, remainingSpace, row, rowIndex) {
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
        var totalWrappedMaxWidth = sum(maxWidths.filter(function (width, maxWidthIndex) {
          return options.wrap.indexOf(maxWidthIndex) >= 0;
        }));
        var availableSpace = Math.max(1, Math.round(maxWidths[index] / totalWrappedMaxWidth * remainingSpace));
        var alignRight = options.alignRight.indexOf(index) >= 0;

        wrapText(cell, availableSpace, currentConcat, nextConcats, alignRight);

        currentConcat += pad(
          nextConcats[0].substring(currentConcat.length, currentConcat.length + availableSpace),
          availableSpace,
          alignRight
        );
      }

      if (index < row.length - 1) {
        currentConcat += TABLE_OPTIONS.margin;
      }
    });

    each(nextConcats, function (nextConcat, nextConcatIndex) {
      if (nextConcatIndex > 0) {
        currentConcat += '\n' + nextConcat;
      }
    });

    if (rowIndex < table.length - 1) {
      currentConcat += '\n';
    }

    return currentConcat;
  }

  function mapRows (table, options, maxWidths, remainingSpace) {
    var concat = '';

    each(table, function (row, rowIndex) {
      concat += mapCells(table, options, maxWidths, remainingSpace, row, rowIndex);
    });

    return concat;
  }

  function createTable (table, options, maxWidths, remainingSpace) {
    return mapRows(table, options, maxWidths, remainingSpace).split('\n').map(function (line) {
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

  function sortByName (a, b) {
    if (a.name < b.name) {
      return -1;
    }

    if (b.name < a.name) {
      return 1;
    }

    return 0;
  }

  function createHelp (schema, globals, error) {
    var commands = [];
    var flags = [];
    var kwargs = [];
    var args = [];
    var flagAndKwargNames = [];

    each(schema.children, function (node) {
      if (node._type === 'command') {
        commands.push(node);
      } else if (node._type === 'flag') {
        flags.push(node);
        flagAndKwargNames.push(node.name);
      } else if (node._type === 'kwarg') {
        kwargs.push(node);
        flagAndKwargNames.push(node.name);
      } else {
        args.push(node);
      }
    });

    if (globals.help && flagAndKwargNames.indexOf(globals.help.name) < 0) {
      flags.unshift(globals.help);
    }

    commands.sort(sortByName);
    flags.sort(sortByName);
    kwargs.sort(sortByName);
    args.sort(sortByName);

    var options = flags.concat(kwargs).concat(args);

    return '\n' +
      (schema.options.usage ? '  Usage: ' + schema.options.usage + '\n\n' : '') +
      createCommandsText(commands) +
      createOptionsText(options) +
      createExamplesText(schema.options.examples) +
      (error ? ('  ' + error + '\n\n') : '');
  }

  /* istanbul ignore next */
  function exitWithHelp (help) {
    process.stderr.write(help);
    process.exit(1);
  }

  function formatNodeName (node) {
    var prefix = node._type === 'flag' || node._type === 'kwarg' ? '--' : '';
    return prefix + node.name;
  }

  function formatRequiredList (nodes) {
    return nodes.map(formatNodeName).join(', ');
  }

  module.exports = {
    find: find,
    each: each,
    any: any,
    several: several,
    sum: sum,
    argsToArray: argsToArray,
    validateChildren: validateChildren,
    getNodeProperties: getNodeProperties,
    validateName: validateName,
    serializeOptions: serializeOptions,
    formatTable: formatTable,
    sortByName: sortByName,
    createHelp: createHelp,
    exitWithHelp: exitWithHelp,
    formatNodeName: formatNodeName,
    formatRequiredList: formatRequiredList
  };

})();
