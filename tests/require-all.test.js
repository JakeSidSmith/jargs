/* global describe, it */

'use strict';

(function () {

  var expect = require('chai').expect;

  var RequireAll = require('../src/require-all');
  var Arg = require('../src/arg');

  describe('require-all.js', function () {

    it('should construct an RequireAll', function () {
      var child1 = Arg('foo');
      var child2 = Arg('bar');
      var node = RequireAll(child1, child2);

      expect(node).to.be.ok;
      expect(node).to.eql({
        _type: 'require-all',
        children: [child1, child2]
      });

      expect(node.children[0]).to.equal(child1);
      expect(node.children[1]).to.equal(child2);
    });

    it('should throw an error if no children are supplied', function () {
      var anError = /child/i;

      expect(RequireAll).to.throw(anError);
    });

    it('should throw an error if less than 2 children are supplied', function () {
      var anError = /child/i;
      var child = Arg('foo');
      var boundRequired = RequireAll.bind(null, child);

      expect(boundRequired).to.throw(anError);
    });

  });

})();
