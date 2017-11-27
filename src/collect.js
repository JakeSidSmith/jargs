'use strict';

(function () {

  /*

  my-program sub-command --flag --kwarg='foo' --kwarg2 "bar" 'baz'

  Automatically removes quotes & splits by spaces (exclusive) and commas (inclusive)

           command       flag      kwarg \w value kwarg       value  arg
  argv: [ 'sub-command' '--flag', '--kwarg=foo', '--kwarg2', 'bar', 'baz' ]
  */

  var utils = require('./utils');
  var argsToArray = utils.argsToArray;
  var find = utils.find;

  var MATCHES_LEADING_HYPHENS = /^-+/;
  var MATCHES_EQUALS_VALUE = /=.*/;
  var MATCHES_NAME_EQUALS = /.*?=/;
  var MATCHES_SINGLE_HYPHEN = /^-[^-]/;

  function findArgOrKWarg (schema, globals, tree, isAlias, kwargName) {
    var matchingFlagOrKWArg = find(schema.children, function (node) {
      return (node._type === 'flag' || node._type === 'kwarg') &&
        (isAlias ? node.options.alias === kwargName : node.name === kwargName);
    });

    if (!matchingFlagOrKWArg) {
      if (
        (globals.help && isAlias && ('alias' in globals.help.options) && kwargName === globals.help.options.alias) ||
        (globals.help && !isAlias && kwargName === globals.help.name)
      ) {
        throw new Error(utils.createHelp(schema, globals));
      } else {
        throw new Error(utils.createHelp(schema, globals, 'Unknown argument: ' + (isAlias ? '-' : '--') + kwargName));
      }
    } else if (
      (matchingFlagOrKWArg.name in tree[matchingFlagOrKWArg._type + 's']) &&
      !matchingFlagOrKWArg.options.multi
    ) {
      throw new Error(utils.createHelp(schema, globals, 'Duplicate argument: ' + (isAlias ? '-' : '--') + kwargName));
    }

    return matchingFlagOrKWArg;
  }

  function checkRequiredArgs (schema, globals, tree) {
    if (schema._requireAll && schema._requireAll.length) {
      utils.each(schema._requireAll, function (node) {
        if (node._type === 'command') {
          if (!tree.command || node.name !== tree.command.name) {
            throw new Error(
              utils.createHelp(schema, globals, 'Required argument ' + utils.formatNodeName(node) + ' was not supplied')
            );
          }
        } else if (!(node.name in tree[node._type + 's'])) {
          throw new Error(
            utils.createHelp(schema, globals, 'Required argument ' + utils.formatNodeName(node) + ' was not supplied')
          );
        }
      });
    }

    if (schema._requireAny && schema._requireAny.length) {
      utils.each(schema._requireAny, function (anyRequired) {
        var anyMatch = utils.any(anyRequired, function (node) {
          if (node._type === 'command') {
            return tree.command && node.name === tree.command.name;
          }

          return (node.name in tree[node._type + 's']);
        });

        if (!anyMatch) {
          throw new Error(
            utils.createHelp(schema, globals, 'Required one of: ' + utils.formatRequiredList(anyRequired))
          );
        }
      });
    }
  }

  function createTree (argv, schema, globals, commands, parentTree) {
    var tree = {
      name: schema.name,
      command: null,
      kwargs: {},
      flags: {},
      args: {}
    };

    if (typeof schema.options.callback === 'function') {
      commands.push(schema.options.callback.bind(null, tree, parentTree));
    }

    while (argv.length) {
      var arg = argv.shift();
      var isPositional = arg.indexOf('-') !== 0; // command or arg

      if (isPositional) {
        var matchingCommand = find(schema.children, function (node) {
          return node._type === 'command' && (node.name === arg || node.options.alias === arg);
        });

        if (matchingCommand) {
          tree.command = createTree(argv, matchingCommand, globals, commands, tree);
        } else {
          var matchingArg = find(schema.children, function (node) {
            return node._type === 'arg' && (node.options.multi || !(node.name in tree.args));
          });

          if (!matchingArg) {
            throw new Error(utils.createHelp(schema, globals, 'Unknown argument: ' + arg));
          } else if (matchingArg.options.multi) {
            tree.args[matchingArg.name] = (tree.args[matchingArg.name] || []).concat(arg);
          } else {
            tree.args[matchingArg.name] = arg;
          }
        }
      } else {
        var containsEquals = arg.indexOf('=') >= 0;
        var isAlias = MATCHES_SINGLE_HYPHEN.test(arg);
        var kwargName = arg.replace(MATCHES_LEADING_HYPHENS, '').replace(MATCHES_EQUALS_VALUE, '');
        var kwargValue = arg.replace(MATCHES_NAME_EQUALS, '');

        var matchingFlagOrKWArg;

        if (isAlias && containsEquals) {
          throw new Error(utils.createHelp(schema, globals, 'Invalid argument syntax: -' + kwargName + '='));
        } else if (isAlias && kwargName.length > 1) {
          var flagNames = kwargName.split('');
          var firstName = flagNames.shift();

          matchingFlagOrKWArg = findArgOrKWarg(schema, globals, tree, isAlias, firstName);

          if (matchingFlagOrKWArg._type === 'flag') {
            tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] = true;

            utils.each(flagNames, function (flagName) {
              matchingFlagOrKWArg = findArgOrKWarg(schema, globals, tree, isAlias, flagName);

              if (matchingFlagOrKWArg._type !== 'flag') {
                throw new Error(utils.createHelp(schema, globals, 'Invalid argument: -' + kwargName));
              } else {
                tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] = true;
              }
            });
          } else {
            tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] = kwargName.substring(1);
          }
        } else {
          matchingFlagOrKWArg = findArgOrKWarg(schema, globals, tree, isAlias, kwargName);

          if (matchingFlagOrKWArg._type === 'flag') {
            tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] = true;
          } else if (containsEquals && !kwargValue) {
            throw new Error(utils.createHelp(schema, globals, 'No value for argument: --' + kwargName));
          } else if (!containsEquals) {
            if (!argv.length) {
              throw new Error(utils.createHelp(schema, globals, 'No value for argument: --' + kwargName));
            }

            if (matchingFlagOrKWArg.options.multi) {
              tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] =
              (tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] || []).concat(argv.shift());
            } else {
              tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] = argv.shift();
            }
          } else if (matchingFlagOrKWArg.options.multi) {
            tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] =
            (tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] || []).concat(kwargValue);
          } else {
            tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] = kwargValue;
          }
        }
      }
    }

    checkRequiredArgs(schema, globals, tree);

    var returned;

    while (commands.length) {
      returned = commands.shift()(returned);
    }

    return tree;
  }

  function collect (/* program, command, argv, ...rootNode */) {
    var args = argsToArray(arguments);
    /* var program = */ args.shift();
    /* var command = */ args.shift();
    var argv = args.shift();
    var rootNode = args.shift();
    var commands = [];

    if (!rootNode) {
      throw new Error('No program defined');
    }

    if (rootNode._type !== 'program') {
      throw new Error('Root node must be a Program');
    }

    if (args.length) {
      throw new Error('Too many root nodes. Collect takes only a single Program root node');
    }

    try {
      return createTree(argv, rootNode, rootNode._globals, commands);
    } catch (error) {
      utils.exitWithHelp(error.message);
    }
  }

  module.exports = collect;

})();
