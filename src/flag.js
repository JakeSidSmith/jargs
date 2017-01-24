'use strict';

(function () {

  var getNodeProperties = require('./utils').getNodeProperties;

  function Flag () {
    var properties = getNodeProperties(arguments);

    properties._type = 'command';

    return properties;
  }

  module.exports = Flag;

})();
