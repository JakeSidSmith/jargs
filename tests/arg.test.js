/* global describe, it */

'use strict';

(function () {

  var expect = require('chai').expect;

  var Arg = require('../src/arg');

  describe('arg.js', function () {

    it('should construct an Arg', function () {
      var node = Arg('foo', null);

      expect(node).to.be.ok;
      expect(node.name).to.equal('foo');
      expect(node.options).to.eql({description: '', multi: false});
      expect(node.children).to.be.undefined;
      expect(node._type).to.equal('arg');
    });

    it('should throw an error if has children', function () {
      var anError = /children/i;

      expect(Arg.bind(null, 'foo', null, 'child')).to.throw(anError);
    });

  });

})();
