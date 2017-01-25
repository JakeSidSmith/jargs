'use strict';

(function () {

  /*

  --flag --kwarg='foo' --kwarg2 "bar" 'baz'

  Automatically removes quotes & splits by spaces

           flag      kwarg \w value kwarg       value  arg
  args: [ '--flag', '--kwarg=foo', '--kwarg2', 'bar', 'baz' ]
  */

  var argsToArray = require('./utils').argsToArray;
  var Jarg = require('./jarg');

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
