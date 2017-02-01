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
    }
  };

  function Program () {
    var properties = getNodeProperties(arguments, true);
    validateName(properties.name);
    serializeOptions(properties.options, validOptions);

    properties._type = 'program';

    return properties;
  }

  module.exports = Program;

})();
