'use strict';

(function () {

  var getNodeProperties = require('./utils').getNodeProperties;

  function Arg () {
    var properties = getNodeProperties(arguments);

    properties._type = 'arg';

    return properties;
  }

  module.exports = Arg;

})();
