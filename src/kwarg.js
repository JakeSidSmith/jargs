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
    },
    options: {
      type: 'array'
    },
    required: {
      type: 'boolean',
      default: false
    },
    type: {
      type: 'string'
    }
  };

  function KWArg () {
    var properties = getNodeProperties(arguments);
    validateName(properties.name);
    serializeOptions(properties.options, validOptions);

    properties._type = 'kwarg';

    return properties;
  }

  module.exports = KWArg;

})();
