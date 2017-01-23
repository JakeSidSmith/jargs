'use strict';

(function () {

  function argsToArray (args) {
    return Array.prototype.slice.call(args);
  }

  module.exports = {
    argsToArray: argsToArray
  };

})();
