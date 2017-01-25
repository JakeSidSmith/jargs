'use strict';

(function () {

  function Jarg (argv, tree, depth) {
    var self = this;

    self._argv = argv;
    self._tree = tree;
    self._depth = depth;

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
          throw new Error('Unknown node type \'' + node._type + '\'in tree at depth ' + self._depth);
      }
    }
  }

  Jarg.prototype.command = function command (query) {
    for (var key in this._commands) {
      if (key === query) {
        console.log('Found command \'' + key + '\'');
      }
    }
  };

  module.exports = Jarg;

})();
