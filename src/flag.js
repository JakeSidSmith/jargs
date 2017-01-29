'use strict';

(function () {

  var utils = require('./utils');
  var getNodeProperties = utils.getNodeProperties;
  var validateName = utils.validateName;

  function Flag () {
    var properties = getNodeProperties(arguments);
    validateName(properties.name);

    properties._type = 'flag';

    return properties;
  }

  module.exports = Flag;

})();
