'use strict';

(function () {

  var utils = require('./utils');
  var getNodeProperties = utils.getNodeProperties;
  var validateName = utils.validateName;
  var serializeOptions = utils.serializeOptions;

  var validOptions = {
    alias: {
      type: 'string',
      length: 1
    },
    description: {
      type: 'string',
      default: ''
    }
  };

  function Flag () {
    var properties = getNodeProperties(arguments);
    validateName(properties.name);
    serializeOptions(properties.options, validOptions);

    properties._type = 'flag';

    return properties;
  }

  module.exports = Flag;

})();
