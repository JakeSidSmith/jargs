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

  });

})();
