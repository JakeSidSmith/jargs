'use strict';

(function () {

  var utils = require('./utils');

  function RequireAll () {
    var children = utils.argsToArray(arguments);

    if (!children.length) {
      throw new Error('No child nodes supplied to RequireAll node');
    }

    utils.validateChildren(children);

    return {
      _type: 'require-all',
      children: children
    };
  }

  module.exports = RequireAll;

})();
