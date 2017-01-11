'use strict';

// Ref: http://docopt.org/

(function () {

  module.exports = {
    collect: require('./collect'),
    Command: require('./command'),
    Arg: require('./arg'),
    KWArg: require('./kwarg'),
  };

})();
