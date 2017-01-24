'use strict';

(function () {

  var getNodeProperties = require('./utils').getNodeProperties;

  function Arg () {
    var properties = getNodeProperties(arguments);

    properties._type = 'command';

    return properties;
  }

  module.exports = Arg;

})();
