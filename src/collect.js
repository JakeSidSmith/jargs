'use strict';

(function () {

  /*

  --flag --kwarg='foo' --kwarg2 "bar" 'baz'

  Automatically removes quotes & splits by spaces

           flag      kwarg \w value kwarg       value  arg
  args: [ '--flag', '--kwarg=foo', '--kwarg2', 'bar', 'baz' ]
  */

  var argsToArray = require('./utils').argsToArray;

  function Jarg (argv, tree, depth) {
    this._argv = argv;
    this._tree = tree;
    this._depth = depth;

    this._commands = {};
    this._kwargs = {};
    this._flags = {};
    this._args = {};

    for (var i = 0; i < this._tree.length; i += 1) {
      var node = this._tree[i];

      switch (node._type) {
        case 'command':
          if (node.name in this._commands) {
            throw new Error('Duplicate command \'' + node.name + '\' in tree at depth ' + this._depth);
          }
          this._commands[node.name] = node;
          break;
        case 'kwarg':
          if (node.name in this._kwargs) {
            throw new Error('Duplicate kwarg \'' + node.name + '\' in tree at depth ' + this._depth);
          }
          this._kwargs[node.name] = node;
          break;
        case 'flag':
          if (node.name in this._flags) {
            throw new Error('Duplicate flag \'' + node.name + '\' in tree at depth ' + this._depth);
          }
          this._flags[node.name] = node;
          break;
        case 'arg':
          if (node.name in this._args) {
            throw new Error('Duplicate arg \'' + node.name + '\' in tree at depth ' + this._depth);
          }
          this._args[node.name] = node;
          break;
        default:
          throw new Error('Unknown node type \'' + node._type + '\'in tree at depth ' + this._depth);
      }
    }
  }

  Jarg.prototype.command = function command (query) {
    for (var key in this._commands) {
      if (key === query) {
        console.log('Found command \'' + key + '\'');
      }
    }
  };

  function collect (/* program, command, argv, ...tree */) {
    var args = argsToArray(arguments);
    var program = args.shift();
    var command = args.shift();
    var argv = args.shift();
    var tree = args;

    console.log(program);
    console.log(command);
    console.log(argv);
    console.log(tree);

    return new Jarg(argv, tree, 0);
  }

  module.exports = collect;

})();
