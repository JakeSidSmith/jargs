'use strict';

// Ref: http://docopt.org/

(function () {

  var argv = [].concat(process.argv);
  var program = argv.shift();
  var command = argv.shift();

  module.exports = {
    collect: require('./collect').bind(null, program, command, argv),
    Command: require('./command'),
    KWArg: require('./kwarg'),
    Flag: require('./flag'),
    Arg: require('./arg')
  };

})();
