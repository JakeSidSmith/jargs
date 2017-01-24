'use strict';

(function () {

  var getNodeProperties = require('./utils').getNodeProperties;

  function Flag () {
    var properties = getNodeProperties(arguments);

    properties._type = 'flag';

    return properties;
  }

  module.exports = Flag;

})();
