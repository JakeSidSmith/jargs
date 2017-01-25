/* global describe, it */

'use strict';

(function () {

  var expect = require('chai').expect;

  var Jarg = require('../src/jarg');
  var Command = require('../src/command');
  var Flag = require('../src/flag');
  var Arg = require('../src/arg');

  describe('jarg.js', function () {

    var installJargsSave = ['install', 'jargs', '--save'];

    var npmTree = [
      Command('install', null,
        Arg('lib'),
        Flag('save'),
        Flag('save-dev'),
        Flag('save-exact')
      ),
      Command('init'),
      Command('run', null,
        Arg('command')
      )
    ];

    var duplicateTree = [
      Command('install'),
      Command('install')
    ];

    it('should exist', function () {
      expect(Jarg).to.be.ok;
      expect(typeof Jarg).to.equal('function');
    });

    it('should construct a Jarg instance', function () {
      var result = new Jarg(installJargsSave, npmTree);

      expect(result._argv).to.equal(installJargsSave);
      expect(result._children).to.equal(npmTree);
      expect(result._depth).to.equal(0);

      expect(result._name).to.be.null;
      expect(result._value).to.be.null;

      expect(result._commands).to.eql({install: npmTree[0], init: npmTree[1], run: npmTree[2]});
      expect(result._kwargs).to.eql({});
      expect(result._flags).to.eql({});
      expect(result._args).to.eql({});
    });

    it('should throw an error for duplicate names', function () {
      var anError = /duplicate.*install.*depth\s0/i;

      function wrapper () {
        new Jarg(installJargsSave, duplicateTree);
      }

      expect(wrapper).to.throw(anError);
    });

    it('should return a new Jarg instance for first command', function () {
      var result = new Jarg(installJargsSave, npmTree);
      var command = result.command();

      expect(command).to.be.ok;
      expect(command instanceof Jarg).to.be.true;
      expect(command.name()).to.equal('install');
      expect(command.value()).to.be.true;
    });

    it('should return a new Jarg instance for matching command', function () {
      var result = new Jarg(installJargsSave, npmTree);
      var command = result.command('install');

      expect(command).to.be.ok;
      expect(command instanceof Jarg).to.be.true;
      expect(command.name()).to.equal('install');
      expect(command.value()).to.be.true;
    });

  });

})();
