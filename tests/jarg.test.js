/* global describe, it */

'use strict';

(function () {

  var expect = require('chai').expect;

  var Jarg = require('../src/jarg');
  var Command = require('../src/command');
  var Arg = require('../src/arg');

  describe('jarg.js', function () {

    it('should exist', function () {
      expect(Jarg).to.be.ok;
      expect(typeof Jarg).to.equal('function');
    });

    it('should construct a Jarg instance', function () {
      var argv = ['install', 'jargs', '--save'];

      var tree = [Command('install', null, Arg('lib'))];

      var result = new Jarg(argv, tree);

      expect(result._argv).to.equal(argv);
      expect(result._tree).to.equal(tree);
      expect(result._depth).to.equal(0);

      expect(result._commands).to.eql({install: tree[0]});
      expect(result._kwargs).to.eql({});
      expect(result._flags).to.eql({});
      expect(result._args).to.eql({});
    });

  });

})();
