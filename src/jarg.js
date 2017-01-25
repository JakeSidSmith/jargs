'use strict';

(function () {

  function Jarg (argv, tree, depth, name, value) {
    var self = this;

    self._argv = argv;
    self._tree = tree;
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

    for (var i = 0; i < self._tree.length; i += 1) {
      var node = self._tree[i];

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

  Jarg.prototype.value = function value () {
    return this._value;
  };

  Jarg.prototype.name = function value () {
    return this._name;
  };

  Jarg.prototype.command = function command (query) {
    var argv = [].concat(this._argv);

    if (!query) {
      if (argv[0] in this._commands) {
        var commandName = argv.shift();

        return new Jarg(argv, this._commands[commandName].children, this._depth + 1, commandName, true);
      }

      return new Jarg([], [], this._depth + 1);
    }

    for (var key in this._commands) {
      if (key === query) {
        console.log('Found command \'' + key + '\'');
      }
    }

    throw new Error('Command \'' + '\' is not defined in tree at depth ' + this._depth);
  };

  module.exports = Jarg;

})();
