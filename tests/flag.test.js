/* global describe, it */

'use strict';

(function () {

  var expect = require('chai').expect;

  var Flag = require('../src/flag');

  describe('flag.js', function () {

    it('should construct a Flag', function () {
      var node = Flag('foo', {alias: 'bar'}, 'child1', 'child2');

      expect(node).to.be.ok;
      expect(node.name).to.equal('foo');
      expect(node.options).to.eql({alias: 'bar'});
      expect(node.children).to.be.undefined;
      expect(node._type).to.equal('flag');
    });

  });

})();
