/* global describe, it */

'use strict';

(function () {

  var expect = require('chai').expect;

  var KWArg = require('../src/kwarg');

  describe('kwarg.js', function () {

    it('should construct a KWArg', function () {
      var node = KWArg('foo', {alias: 'f'});

      expect(node).to.be.ok;
      expect(node.name).to.equal('foo');
      expect(node.options).to.eql({alias: 'f', description: '', multi: false});
      expect(node.children).to.be.undefined;
      expect(node._type).to.equal('kwarg');
    });

    it('should throw an error if alias is more than 1 char', function () {
      var anError = /length/;
      var node = KWArg.bind(null, 'foo', {alias: 'fo'});

      expect(node).to.throw(anError);
    });

    it('should throw an error if has children', function () {
      var anError = /children/i;

      expect(KWArg.bind(null, 'foo', null, 'child')).to.throw(anError);
    });

  });

})();
