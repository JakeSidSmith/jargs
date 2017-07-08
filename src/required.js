'use strict';

(function () {

  var utils = require('./utils');

  function Required () {
    var children = utils.argsToArray(arguments);

    if (!children.length) {
      throw new Error('No child nodes supplied to Required node');
    }

    if (children.length > 1) {
      throw new Error('More than one child node supplied to Required node');
    }

    utils.validateChildren(children);

    return {
      _type: 'required',
      children: children
    };
  }

  module.exports = Required;

})();
