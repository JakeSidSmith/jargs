'use strict';

(function () {

  /*

  --flag --kwarg='foo' --kwarg2 "bar" 'baz'

  Automatically removes quotes & splits by spaces (exclusive) and commas (inclusive)

           flag      kwarg \w value kwarg       value  arg
  args: [ '--flag', '--kwarg=foo', '--kwarg2', 'bar', 'baz' ]
  */

  var utils = require('./utils');
  var argsToArray = utils.argsToArray;
  var find = utils.find;
  var each = utils.each;

  var MATCHES_LEADING_HYPHENS = /^-+/;
  var MATCHES_EQUALS_VALUE = /=.*/;
  var MATCHES_NAME_EQUALS = /.*=/;
  var MATCHES_SINGLE_HYPHEN = /^-[^-]/;

  function createTree (argv, schema, name, value) {
    argv = [].concat(argv);

    var tree = {
      command: null,
      kwargs: {},
      flags: {},
      args: {}
    };

    if (typeof name !== 'undefined') {
      tree.name = name;
    }

    if (typeof value !== 'undefined') {
      tree.value = value;
    }

    if (!argv.length) {
      return tree;
    }

    while (argv.length) {
      var arg = argv.shift();
      var isPositional = arg.indexOf('-') !== 0; // command or arg

      if (isPositional) {
        var matchingCommand = find(schema, function (node) {
          return node._type === 'command' && (node.name === arg || node.options.alias === arg);
        });

        if (matchingCommand) {
          tree.command = createTree(argv, matchingCommand.children, matchingCommand.name);
        } else {
          each(schema, function (node) {
            if (node._type === 'arg' && !tree.args[node.name]) {
              tree.args[node.name] = createTree(argv, node.children, undefined, arg);
            }
          });
        }
      } else {
        var containsEquals = arg.indexOf('=') >= 0;
        var isAlias = MATCHES_SINGLE_HYPHEN.test(arg);
        var kwargName = arg.replace(MATCHES_LEADING_HYPHENS, '').replace(MATCHES_EQUALS_VALUE, '');
        var kwargValue = arg.replace(MATCHES_NAME_EQUALS, '');

        var matchingFlagOrKWArg = find(schema, function (node) {
          return (node._type === 'flag' || node._type === 'kwarg') &&
            (isAlias ? node.options.alias === kwargName : node.name === kwargName);
        });

        if (matchingFlagOrKWArg && !tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name]) {
          if (matchingFlagOrKWArg._type === 'flag') {
            kwargValue = true;
          } else if (!containsEquals) {
            kwargValue = argv.shift();
          }

          tree[matchingFlagOrKWArg._type + 's'][matchingFlagOrKWArg.name] =
            createTree(argv, matchingFlagOrKWArg.children, undefined, kwargValue);
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
    var schema = args;

    return createTree(argv, schema);
  }

  module.exports = collect;

})();
