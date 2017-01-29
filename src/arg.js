'use strict';

(function () {

  var utils = require('./utils');
  var getNodeProperties = utils.getNodeProperties;
  var validateName = utils.validateName;

  function Arg () {
    var properties = getNodeProperties(arguments);
    validateName(properties.name);

    properties._type = 'arg';

    return properties;
  }

  module.exports = Arg;

})();
