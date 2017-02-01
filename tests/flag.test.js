/* global describe, it */

'use strict';

(function () {

  var expect = require('chai').expect;

  var Flag = require('../src/flag');

  describe('flag.js', function () {

    it('should construct a Flag', function () {
      var node = Flag('foo', {alias: 'bar'});

      expect(node).to.be.ok;
      expect(node.name).to.equal('foo');
      expect(node.options).to.eql({alias: 'bar', description: '', usage: '', required: false});
      expect(node.children).to.be.undefined;
      expect(node._type).to.equal('flag');
    });

    it('should throw an error if has children', function () {
      var anError = /children/i;

      expect(Flag.bind(null, 'foo', null, 'child')).to.throw(anError);
    });

  });

})();
