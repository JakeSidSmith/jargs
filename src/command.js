'use strict';

(function () {

  var getNodeProperties = require('./utils').getNodeProperties;

  function Command () {
    var properties = getNodeProperties(arguments);

    properties._type = 'command';

    return properties;
  }

  module.exports = Command;

})();
