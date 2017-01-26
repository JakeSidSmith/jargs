'use strict';

(function () {

  var find = require('./utils').find;

  function Jarg (argv, children, depth, name, value) {
    var self = this;

    self._argv = argv;
    self._children = children;
    self._depth = depth || 0;

    self._name = name || null;
    self._value = value || null;

    self._nodes = [];
    self._commands = [];
    self._kwargs = [];
    self._flags = [];
    self._args = [];

    function addNode (node) {
      var type = node._type;

      if (self['_' + type + 's'].indexOf(node.name) >= 0) {
        throw new Error('Duplicate ' + type + ' \'' + node.name + '\' in tree at depth ' + self._depth);
      }

      self._nodes.push(node.name);
      self['_' + type + 's'].push(node.name);
    }

    for (var i = 0; i < self._children.length; i += 1) {
      var node = self._children[i];

      switch (node._type) {
        case 'command':
        case 'kwarg':
        case 'flag':
        case 'arg':
          addNode(node);
          break;
        default:
          throw new Error('Unknown node type \'' + node._type + '\' in tree at depth ' + self._depth);
      }
    }
  }

  Jarg.prototype.name = function value () {
    return this._name;
  };

  Jarg.prototype.value = function value () {
    return this._value;
  };

  Jarg.prototype.command = function command (query) {
    var self = this;

    var argv = [].concat(self._argv);
    var commandName = argv.shift();

    if (query && self._commands.indexOf(query) < 0) {
      throw new Error('Command \'' + query + '\' is not defined in tree at depth ' + self._depth);
    }

    if ((!query || query === commandName) && self._commands.indexOf(commandName) >= 0) {
      var matchingNode = find(self._children, function (node) {
        return node._type === 'command' && node.name === commandName;
      });

      return new Jarg(argv, matchingNode.children, self._depth + 1, commandName, true);
    }

    return new Jarg([], [], self._depth + 1);
  };

  module.exports = Jarg;

})();
