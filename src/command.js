'use strict';

(function () {

  var utils = require('./utils');
  var getNodeProperties = utils.getNodeProperties;
  var validateName = utils.validateName;

  function Command () {
    var properties = getNodeProperties(arguments);
    validateName(properties.name);

    properties._type = 'command';

    return properties;
  }

  module.exports = Command;

})();
