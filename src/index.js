'use strict';

// Ref: http://docopt.org/

(function () {

  module.exports = {
    collect: require('./collect'),
    Help: require('./help'),
    Program: require('./program'),
    Command: require('./command'),
    KWArg: require('./kwarg'),
    Flag: require('./flag'),
    Arg: require('./arg'),
    Required: require('./required'),
    RequireAll: require('./require-all'),
    RequireAny: require('./require-any')
  };

})();
