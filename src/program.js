'use strict';

(function () {

  var utils = require('./utils');
  var getNodeProperties = utils.getNodeProperties;
  var validateName = utils.validateName;
  var serializeOptions = utils.serializeOptions;

  var validOptions = {
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

  function Program () {
    var properties = getNodeProperties(arguments, true);
    validateName(properties.name);
    serializeOptions(properties.options, validOptions);

    properties._type = 'program';
    properties._globals = {};

    return properties;
  }

  module.exports = Program;

})();
