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

  function createTree (argv, schema, name, value) {
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
          return node._type === 'command' && node.name === arg;
        });

        if (matchingCommand) {
          tree.command = createTree(argv, matchingCommand.children, matchingCommand.name);
        } else {
          each(schema, function (node) {
            if (node._type === 'arg') {
              tree.args[node.name] = createTree(argv, node.children, undefined, arg);
            }
          });
        }
      }
    }

    return tree;
  }

  function collect (/* program, command, argv, ...tree */) {
    var args = argsToArray(arguments);
    /* var program = */ args.shift();
    /* var command = */ args.shift();
    var argv = [].concat(args.shift());
    var schema = args;

    return createTree(argv, schema);
  }

  module.exports = collect;

})();
