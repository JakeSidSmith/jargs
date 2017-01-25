/* global describe, it */

'use strict';

(function () {

  var expect = require('chai').expect;

  var Command = require('../src/command');

  describe('command.js', function () {

    it('should construct a Command', function () {
      var node = Command('foo', {alias: 'bar'}, 'child1', 'child2');

      expect(node).to.be.ok;
      expect(node.name).to.equal('foo');
      expect(node.options).to.eql({alias: 'bar'});
      expect(node.children).to.eql(['child1', 'child2']);
      expect(node._type).to.equal('command');
    });

  });

})();
