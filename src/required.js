'use strict';

(function () {

  var utils = require('./utils');

  var VALID_CHILD_NODES = [
    'arg',
    'flag',
    'kwarg',
    'command'
  ];

  function Required () {
    var children = utils.argsToArray(arguments);

    if (!children.length) {
      throw new Error('No child nodes supplied to Required node');
    }

    if (children.length > 1) {
      throw new Error('More than one child node supplied to Required node. Use RequireAll node');
    }

    utils.validateChildren(children, VALID_CHILD_NODES);

    return {
      _type: 'required',
      children: children
    };
  }

  module.exports = Required;

})();
