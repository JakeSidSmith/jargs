'use strict';

(function () {

  var utils = require('./utils');

  function RequireAny () {
    var children = utils.argsToArray(arguments);

    if (!children.length) {
      throw new Error('No child nodes supplied to RequireAny node');
    }

    utils.validateChildren(children);

    return {
      _type: 'require-any',
      children: children
    };
  }

  module.exports = RequireAny;

})();
