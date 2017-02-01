'use strict';

(function () {

  /*

  my-program sub-command --flag --kwarg='foo' --kwarg2 "bar" 'baz'

  Automatically removes quotes & splits by spaces (exclusive) and commas (inclusive)

           command       flag      kwarg \w value kwarg       value  arg
  args: [ 'sub-command' '--flag', '--kwarg=foo', '--kwarg2', 'bar', 'baz' ]
  */

  var utils = require('./utils');
  var argsToArray = utils.argsToArray;
  var throwError = utils.throwError;
  var find = utils.find;

  var MATCHES_LEADING_HYPHENS = /^-+/;
  var MATCHES_EQUALS_VALUE = /=.*/;
  var MATCHES_NAME_EQUALS = /.*=/;
  var MATCHES_SINGLE_HYPHEN = /^-[^-]/;

  function createTree (argv, schema, value) {
    var tree = {
      command: null,
      kwargs: {},
      flags: {},
      args: {}
    };

    if (schema._type === 'command') {
      tree.name = schema.name;
    } else if (typeof value !== 'undefined') {
      tree.value = value;
    }

    if (!argv.length) {
      return tree;
    }

    while (argv.length) {
      var arg = argv.shift();
      var isPositional = arg.indexOf('-') !== 0; // command or arg

      if (isPositional) {
        var matchingCommand = find(schema.children, function (node) {
          return node._type === 'command' && (node.name === arg || node.options.alias === arg);
        });

        if (matchingCommand) {
          if (matchingCommand.children.length) {
            tree.command = createTree(argv, matchingCommand);
          } else {
            tree.command = {
              name: matchingCommand.name,
              command: null,
              kwargs: {},
              flags: {},
              args: {}
            };
          }
        } else {
          var matchingArg = find(schema.children, function (node) {
            return node._type === 'arg' && !tree.args[node.name];
          });

          if (!matchingArg) {
            throwError('Unknown argument: ' + arg);
          } else {
            var argValue = arg;

            if (matchingArg.children.length) {
              tree.args[matchingArg.name] = createTree(argv, matchingArg, argValue);
            } else {
              tree.args[matchingArg.name] = {
                value: argValue,
                command: null,
                kwargs: {},
                flags: {},
                args: {}
              };
            }
          }
        }
      } else {
        var containsEquals = arg.indexOf('=') >= 0;
        var isAlias = MATCHES_SINGLE_HYPHEN.test(arg);
        var kwargName = arg.replace(MATCHES_LEADING_HYPHENS, '').replace(MATCHES_EQUALS_VALUE, '');
        var kwargValue = arg.replace(MATCHES_NAME_EQUALS, '');

        var matchingFlagOrKWArg = find(schema.children, function (node) {
          return (node._type === 'flag' || node._type === 'kwarg') &&
            (isAlias ? node.options.alias === kwargName : node.name === kwargName);
        });

        if (!matchingFlagOrKWArg) {
          throwError('Unknown argument: ' + arg);
        } else if (tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name]) {
          throwError('Duplicate argument: ' + arg);
        } else {
          if (matchingFlagOrKWArg._type === 'flag') {
            kwargValue = true;
          } else if (!containsEquals) {
            kwargValue = argv.shift();
          }

          if (matchingFlagOrKWArg.children.length) {
            tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] =
              createTree(argv, matchingFlagOrKWArg, kwargValue);
          } else {
            tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] = {
              value: kwargValue,
              command: null,
              kwargs: {},
              flags: {},
              args: {}
            };
          }
        }
      }
    }

    return tree;
  }

  function collect (/* program, command, argv, ...tree */) {
    var args = argsToArray(arguments);
    /* var program = */ args.shift();
    /* var command = */ args.shift();
    var argv = args.shift();
    var schema = {children: args};

    return createTree(argv, schema);
  }

  module.exports = collect;

})();
