'use strict';

(function () {

  var expect = require('chai').expect;

  var Jarg = require('../src/jarg');

  describe('jarg.js', function () {

    it('should exist', function () {
      expect(Jarg).to.be.ok;
      expect(typeof Jarg).to.equal('function');
    });

  });

})();
