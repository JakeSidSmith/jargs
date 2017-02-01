/* global describe, it */

'use strict';

(function () {

  var expect = require('chai').expect;

  var Program = require('../src/program');

  describe('program.js', function () {

    it('should construct a Program', function () {
      var node = Program('foo', null, 'child1', 'child2');

      expect(node).to.be.ok;
      expect(node.name).to.equal('foo');
      expect(node.options).to.eql({description: '', usage: ''});
      expect(node.children).to.eql(['child1', 'child2']);
      expect(node._type).to.equal('program');
    });

  });

})();
