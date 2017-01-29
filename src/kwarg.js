'use strict';

(function () {

  var utils = require('./utils');
  var getNodeProperties = utils.getNodeProperties;
  var validateName = utils.validateName;

  function KWArg () {
    var properties = getNodeProperties(arguments);
    validateName(properties.name);

    properties._type = 'kwarg';

    return properties;
  }

  module.exports = KWArg;

})();
