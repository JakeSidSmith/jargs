'use strict';

(function () {

  var expect = require('chai').expect;

  var Arg = require('../src/arg');

  describe('arg.js', function () {

    it('should construct an Arg', function () {
      var node = Arg('foo', {alias: 'bar'}, 'child1', 'child2');

      expect(node).to.be.ok;
      expect(node.name).to.equal('foo');
      expect(node.options).to.eql({alias: 'bar'});
      expect(node.children).to.eql(['child1', 'child2']);
      expect(node._type).to.equal('arg');
    });

  });

})();
