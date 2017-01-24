'use strict';

(function () {

  var expect = require('chai').expect;

  var collect = require('../src/collect');

  describe('collect.js', function () {

    it('should exist', function () {
      expect(collect).to.be.ok;
      expect(typeof collect).to.equal('function');
    });

  });

})();
