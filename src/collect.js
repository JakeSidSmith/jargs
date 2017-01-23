'use strict';

(function () {

  function collect (program, command, argv, tree) {
    console.log(program);
    console.log(command);
    console.log(argv);
    console.log(tree);
  }

  module.exports = collect;

})();
