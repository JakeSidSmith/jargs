'use strict';

(function () {

  /*

  --flag --kwarg='foo' --kwarg2 "bar" 'baz'

  Automatically removes quotes & splits by spaces

           flag      kwarg \w value kwarg       value  arg
  args: [ '--flag', '--kwarg=foo', '--kwarg2', 'bar', 'baz' ]
  */

  var utils = require('./utils');
  var argsToArray = utils.argsToArray;
  var find = utils.find;
  var each = utils.each;

  function createTree (argv, tree, name, value) {
    var result = {
      command: null,
      kwargs: {},
      flags: {},
      args: {}
    };

    if (typeof name !== 'undefined') {
      result.name = name;
    }

    if (typeof value !== 'undefined') {
      result.value = value;
    }

    if (!argv.length) {
      return result;
    }

    while (argv.length) {
      var arg = argv.shift();
      var isPositional = arg.indexOf('-') !== 0; // command or arg

      if (isPositional) {
        var matchingCommand = find(tree, function (node) {
          return node._type === 'command' && node.name === arg;
        });

        if (matchingCommand) {
          result.command = createTree(argv, matchingCommand.children, matchingCommand.name);
        } else {
          each(tree, function (node) {
            if (node._type === 'arg') {
              result.args[node.name] = createTree(argv, node.children, undefined, arg);
            }
          });
        }
      }
    }

    return result;
  }

  function collect (/* program, command, argv, ...tree */) {
    var args = argsToArray(arguments);
    /* var program = */ args.shift();
    /* var command = */ args.shift();
    var argv = [].concat(args.shift());
    var tree = args;

    return createTree(argv, tree);
  }

  module.exports = collect;

})();
