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

  function findArgOrKWarg (schema, tree, isAlias, kwargName) {
    var matchingFlagOrKWArg = find(schema.children, function (node) {
      return (node._type === 'flag' || node._type === 'kwarg') &&
        (isAlias ? node.options.alias === kwargName : node.name === kwargName);
    });

    if (!matchingFlagOrKWArg) {
      throw new Error(utils.createHelp(schema, 'Unknown argument: ' + (isAlias ? '-' : '--') + kwargName));
    } else if (matchingFlagOrKWArg.name in tree[matchingFlagOrKWArg._type + 's']) {
      throw new Error(utils.createHelp(schema, 'Duplicate argument: ' + (isAlias ? '-' : '--') + kwargName));
    }

    return matchingFlagOrKWArg;
  }

  function formatNodeName (node) {
    var prefix = node._type === 'flag' || node._type === 'kwarg' ? '--' : '';
    return prefix + node.name;
  }

  function formatRequiredList (nodes) {
    return nodes.map(formatNodeName).join(', ');
  }

  function checkRequiredArgs (schema, tree) {
    if (schema.requireAll && schema.requireAll.length) {
      utils.each(schema.requireAll, function (node) {
        if (node._type === 'command') {
          if (!tree.command || node.name !== tree.command.name) {
            throw new Error(
              utils.createHelp(schema, 'Required argument ' + formatNodeName(node) + ' was not supplied')
            );
          }
        } else if (!(node.name in tree[node._type + 's'])) {
          throw new Error(
            utils.createHelp(schema, 'Required argument ' + formatNodeName(node) + ' was not supplied')
          );
        }
      });
    }

    if (schema.requireAny && schema.requireAny.length) {
      utils.each(schema.requireAny, function (anyRequired) {
        var anyMatch = utils.any(anyRequired, function (node) {
          if (node._type === 'command') {
            return tree.command && node.name === tree.command.name;
          }

          return (node.name in tree[node._type + 's']);
        });

        if (!anyMatch) {
          throw new Error(utils.createHelp(schema, 'Required one of: ' + formatRequiredList(anyRequired)));
        }
      });
    }
  }

  function createTree (argv, schema, commands) {
    var tree = {
      command: null,
      kwargs: {},
      flags: {},
      args: {}
    };

    if (schema._type === 'command') {
      tree.name = schema.name;
    }

    if (typeof schema.options.callback === 'function') {
      commands.push(schema.options.callback.bind(null, tree));
    }

    while (argv.length) {
      var arg = argv.shift();
      var isPositional = arg.indexOf('-') !== 0; // command or arg

      if (isPositional) {
        var matchingCommand = find(schema.children, function (node) {
          return node._type === 'command' && (node.name === arg || node.options.alias === arg);
        });

        if (matchingCommand) {
          tree.command = createTree(argv, matchingCommand, commands);
        } else {
          var matchingArg = find(schema.children, function (node) {
            return node._type === 'arg' && !(node.name in tree.args);
          });

          if (!matchingArg) {
            throw new Error(utils.createHelp(schema, 'Unknown argument: ' + arg));
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
          throw new Error(utils.createHelp(schema, 'Invalid argument syntax: -' + kwargName + '='));
        } else if (isAlias && kwargName.length > 1) {
          var flagNames = kwargName.split('');
          var firstName = flagNames.shift();

          matchingFlagOrKWArg = findArgOrKWarg(schema, tree, isAlias, firstName);

          if (matchingFlagOrKWArg._type === 'flag') {
            tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] = true;

            utils.each(flagNames, function (flagName) {
              matchingFlagOrKWArg = findArgOrKWarg(schema, tree, isAlias, flagName);

              if (matchingFlagOrKWArg._type !== 'flag') {
                throw new Error(utils.createHelp(schema, 'Invalid argument: -' + kwargName));
              } else {
                tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] = true;
              }
            });
          } else {
            tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] = kwargName.substring(1);
          }
        } else {
          matchingFlagOrKWArg = findArgOrKWarg(schema, tree, isAlias, kwargName);

          if (matchingFlagOrKWArg._type === 'flag') {
            tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] = true;
          } else if (containsEquals && !kwargValue) {
            throw new Error(utils.createHelp(schema, 'No value for argument: --' + kwargName));
          } else if (!containsEquals) {
            tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] = argv.shift();
          } else {
            tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] = kwargValue;
          }
        }
      }
    }

    checkRequiredArgs(schema, tree);

    while (commands.length) {
      commands.shift()();
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
      return createTree(argv, rootNode, commands);
    } catch (error) {
      utils.exitWithHelp(error.message);
    }
  }

  module.exports = collect;

})();
