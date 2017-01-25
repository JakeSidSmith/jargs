'use strict';

(function () {

  function argsToArray (args) {
    return Array.prototype.slice.call(args);
  }

  function getNodeProperties (args) {
    var argsArray = argsToArray(args);
    var name = argsArray.shift();
    var options = argsArray.shift() || {};

    return {
      name: name,
      options: options,
      children: argsArray
    };
  }

  module.exports = {
    argsToArray: argsToArray,
    getNodeProperties: getNodeProperties
  };

})();
