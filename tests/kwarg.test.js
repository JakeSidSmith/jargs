/* global describe, it */

'use strict';

(function () {

  var expect = require('chai').expect;

  var KWArg = require('../src/kwarg');

  describe('kwarg.js', function () {

    it('should construct a KWArg', function () {
      var node = KWArg('foo', {alias: 'bar'});

      expect(node).to.be.ok;
      expect(node.name).to.equal('foo');
      expect(node.options).to.eql({alias: 'bar'});
      expect(node.children).to.be.undefined;
      expect(node._type).to.equal('kwarg');
    });

    it('should throw an error if has children', function () {
      var anError = /children/i;

      expect(KWArg.bind(null, 'foo', null, 'child')).to.throw(anError);
    });

  });

})();
