/* global describe, it */

'use strict';

(function () {

  var expect = require('chai').expect;

  var Required = require('../src/required');
  var Arg = require('../src/arg');

  describe('required.js', function () {

    it('should construct an Required', function () {
      var child = Arg('foo');
      var node = Required(child);

      expect(node).to.be.ok;
      expect(node).to.eql({
        _type: 'required',
        children: [child]
      });

      expect(node.children[0]).to.equal(child);
    });

    it('should throw an error if no children are supplied', function () {
      var anError = /child/i;

      expect(Required).to.throw(anError);
    });

    it('should throw an error if more than one children are supplied', function () {
      var anError = /child/i;
      var child1 = Arg('foo');
      var child2 = Arg('bar');
      var boundRequired = Required.bind(null, child1, child2);

      expect(boundRequired).to.throw(anError);
    });

  });

})();
