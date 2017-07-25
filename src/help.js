'use strict';

(function () {

  var utils = require('./utils');
  var validateName = utils.validateName;
  var serializeOptions = utils.serializeOptions;

  var VALID_CHILD_NODES = [
    'program'
  ];

  var validOptions = {
    alias: {
      type: 'string',
      length: 1
    },
    description: {
      type: 'string',
      default: ''
    }
  };

  function Help () {
    var children = utils.argsToArray(arguments);
    var name = children.shift();
    var options = children.shift() || {};
    serializeOptions(options, validOptions);

    if (!children.length) {
      throw new Error('No child nodes supplied to Help node');
    }

    if (children.length > 1) {
      throw new Error('More than one child node supplied to Help node');
    }

    utils.validateChildren(children, VALID_CHILD_NODES);
    validateName(name);

    children[0]._globals.help = {
      _type: 'flag',
      name: name,
      options: options
    };

    return children[0];
  }

  module.exports = Help;

})();
