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
    options: {
      type: 'array'
    },
    type: {
      type: 'string'
    },
    multi: {
      type: 'boolean',
      default: false
    }
  };

  function Arg () {
    var properties = getNodeProperties(arguments);
    validateName(properties.name);
    serializeOptions(properties.options, validOptions);

    properties._type = 'arg';

    return properties;
  }

  module.exports = Arg;

})();
