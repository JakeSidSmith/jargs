'use strict';

(function () {

  var argsToArray = require('./utils').argsToArray;

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
  }

  module.exports = collect;

})();
