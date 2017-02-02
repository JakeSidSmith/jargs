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
  var find = utils.find;

  var MATCHES_LEADING_HYPHENS = /^-+/;
  var MATCHES_EQUALS_VALUE = /=.*/;
  var MATCHES_NAME_EQUALS = /.*=/;
  var MATCHES_SINGLE_HYPHEN = /^-[^-]/;

  function createTree (argv, schema) {
    var tree = {
      command: null,
      kwargs: {},
      flags: {},
      args: {}
    };

    if (schema._type === 'command') {
      tree.name = schema.name;
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
          tree.command = createTree(argv, matchingCommand);
        } else {
          var matchingArg = find(schema.children, function (node) {
            return node._type === 'arg' && !(node.name in tree.args);
          });

          if (!matchingArg) {
            utils.throwError('Unknown argument: ' + arg);
          } else {
            tree.args[matchingArg.name] = arg;
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
          utils.throwError('Unknown argument: ' + kwargName);
        } else if (matchingFlagOrKWArg.name in tree[matchingFlagOrKWArg._type + 's']) {
          utils.throwError('Duplicate argument: ' + kwargName);
        } else {
          if (matchingFlagOrKWArg._type === 'flag') {
            kwargValue = true;
          } else if (!containsEquals) {
            kwargValue = argv.shift();
          }

          tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] = kwargValue;
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
    var program = args.shift();

    if (!program) {
      throw new Error('No program defined');
    }

    if (program._type !== 'program') {
      throw new Error('Root node must be a Program');
    }

    return createTree(argv, program);
  }

  module.exports = collect;

})();
