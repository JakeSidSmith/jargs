/* global describe, it */

'use strict';

(function () {

  var expect = require('chai').expect;

  var collect = require('../src/collect');
  var Jarg = require('../src/jarg');
  var Command = require('../src/command');
  var Arg = require('../src/arg');

  describe('collect.js', function () {

    it('should exist', function () {
      expect(collect).to.be.ok;
      expect(typeof collect).to.equal('function');
    });

    it('should return a Jarg instance', function () {
      var result;
      var boundCollect = collect.bind(null, 'node', 'npm', ['install', 'jargs', '--save']);

      // Without tree
      result = boundCollect();

      expect(result instanceof Jarg).to.be.true;

      // With single node
      result = boundCollect(
        Command(
          'npm'
        )
      );

      expect(result instanceof Jarg).to.be.true;

      // With nested nodes
      result = boundCollect(
        Command(
          'npm',
          null,
          Arg(
            'lib'
          )
        )
      );

      expect(result instanceof Jarg).to.be.true;
    });

  });

})();
