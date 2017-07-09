'use strict';

(function () {

  var utils = require('./utils');
  var getNodeProperties = utils.getNodeProperties;
  var validateName = utils.validateName;
  var serializeOptions = utils.serializeOptions;

  var validOptions = {
    alias: {
      type: 'string'
    },
    description: {
      type: 'string',
      default: ''
    },
    usage: {
      type: 'string',
      default: ''
    },
    callback: {
      type: 'function'
    },
    examples: {
      type: 'array',
      default: []
    }
  };

  function Command () {
    var properties = getNodeProperties(arguments, true);
    validateName(properties.name);
    serializeOptions(properties.options, validOptions);

    properties._type = 'command';

    return properties;
  }

  module.exports = Command;

})();
