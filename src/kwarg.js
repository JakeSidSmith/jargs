'use strict';

(function () {

  var getNodeProperties = require('./utils').getNodeProperties;

  function KWArg () {
    var properties = getNodeProperties(arguments);

    properties._type = 'command';

    return properties;
  }

  module.exports = KWArg;

})();
