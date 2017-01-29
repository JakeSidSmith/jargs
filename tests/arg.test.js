/* global describe, it */

'use strict';

(function () {

  var expect = require('chai').expect;

  var Arg = require('../src/arg');

  describe('arg.js', function () {

    it('should construct an Arg', function () {
      var node = Arg('foo', null, 'child1', 'child2');

      expect(node).to.be.ok;
      expect(node.name).to.equal('foo');
      expect(node.options).to.eql({});
      expect(node.children).to.eql(['child1', 'child2']);
      expect(node._type).to.equal('arg');
    });

  });

})();
