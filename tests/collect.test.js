'use strict';

(function () {

  var expect = require('chai').expect;

  var collect = require('../src/collect');
  var Jarg = require('../src/jarg');
  var Command = require('../src/command');

  describe('collect.js', function () {

    it('should exist', function () {
      expect(collect).to.be.ok;
      expect(typeof collect).to.equal('function');
    });

    it('should return a Jarg instance', function () {
      var boundCollect = collect.bind(null, 'node', 'npm', ['install', 'jargs', '--save']);

      var result = boundCollect(
        Command(
          'npm'
        )
      );

      expect(result instanceof Jarg).to.be.true;
    });

  });

})();
