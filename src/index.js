'use strict';

// Ref: http://docopt.org/

(function () {

  module.exports = {
    collect: require('./collect'),
    Command: require('./command'),
    KWArg: require('./kwarg'),
    Flag: require('./flag'),
    Arg: require('./arg')
  };

})();
