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
      type: 'string'
    },
    usage: {
      type: 'string'
    },
    options: {
      type: 'array'
    },
    required: {
      type: 'boolean'
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
