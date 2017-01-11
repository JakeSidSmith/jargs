'use strict';

(function () {

  function collect (/* tree */) {
    var argv = [].concat(process.argv);
    var program = argv.shift();
    var command = argv.shift();

    console.log(program);
    console.log(command);
    console.log(argv);
  }

  module.exports = collect;

})();
