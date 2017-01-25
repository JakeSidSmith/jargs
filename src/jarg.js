'use strict';

(function () {

  function Jarg (argv, children, depth, name, value) {
    var self = this;

    self._argv = argv;
    self._children = children;
    self._depth = depth || 0;

    self._name = name || null;
    self._value = value || null;

    self._commands = {};
    self._kwargs = {};
    self._flags = {};
    self._args = {};

    function addNode (node) {
      var type = node._type;

      if (node.name in self['_' + type + 's']) {
        throw new Error('Duplicate ' + type + ' \'' + node.name + '\' in tree at depth ' + self._depth);
      }

      self['_' + type + 's'][node.name] = node;
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

    if (!query) {
      if (commandName in self._commands) {
        return new Jarg(argv, self._commands[commandName].children, self._depth + 1, commandName, true);
      }

      return new Jarg([], [], self._depth + 1);
    }

    if (!(query in self._commands)) {
      throw new Error('Command \'' + query + '\' is not defined in tree at depth ' + self._depth);
    }

    for (var key in self._commands) {
      if (key === query && key === commandName) {
        return new Jarg(argv, self._commands[commandName].children, self._depth + 1, commandName, true);
      }
    }

    return new Jarg([], [], self._depth + 1);
  };

  module.exports = Jarg;

})();
