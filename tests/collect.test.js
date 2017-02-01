/* global describe, it */

'use strict';

(function () {

  var expect = require('chai').expect;
  var stub = require('sinon').stub;

  var collect = require('../src/collect');
  var Command = require('../src/command');
  var KWArg = require('../src/kwarg');
  var Flag = require('../src/flag');
  var Arg = require('../src/arg');
  var utils = require('../src/utils');

  describe('collect.js', function () {

    it('should exist', function () {
      expect(collect).to.be.ok;
      expect(typeof collect).to.equal('function');
    });

    it('should return an arg tree when no args provided', function () {
      var boundCollect = collect.bind(null, 'node', 'npm', []);

      // Without tree
      var result = boundCollect(
        Command(
          'install'
        )
      );

      expect(result).to.eql({
        command: null,
        kwargs: {},
        flags: {},
        args: {}
      });

    });

    it('should return an arg tree when no schema provided', function () {
      var boundCollect = collect.bind(null, 'node', 'npm', []);

      // Without tree
      var result = boundCollect();

      expect(result).to.eql({
        command: null,
        kwargs: {},
        flags: {},
        args: {}
      });

    });

    it('should return an arg tree for single command schema', function () {
      var boundCollect = collect.bind(null, 'node', 'npm', ['install']);

      // With single node
      var result = boundCollect(
        Command(
          'install'
        )
      );

      expect(result).to.eql({
        command: {
          name: 'install',
          command: null,
          kwargs: {},
          flags: {},
          args: {}
        },
        kwargs: {},
        flags: {},
        args: {}
      });

    });

    it('should return an arg tree with nested schema', function () {
      var boundCollect = collect.bind(null, 'node', 'npm', ['install', 'jargs']);

      // With nested nodes
      var result = boundCollect(
        Command(
          'install',
          null,
          Arg(
            'lib'
          )
        )
      );

      expect(result).to.eql({
        command: {
          name: 'install',
          command: null,
          kwargs: {},
          flags: {},
          args: {
            lib: 'jargs'
          }
        },
        kwargs: {},
        flags: {},
        args: {}
      });
    });

    it('should return an arg tree with nested schema and flags', function () {
      var boundCollect = collect.bind(null, 'node', 'npm', ['install', 'jargs', '--save']);

      // With nested nodes
      var result = boundCollect(
        Command(
          'install',
          null,
          Arg(
            'lib'
          ),
          Flag(
            'save'
          )
        )
      );

      expect(result).to.eql({
        command: {
          name: 'install',
          command: null,
          kwargs: {},
          flags: {
            save: true
          },
          args: {
            lib: 'jargs'
          }
        },
        kwargs: {},
        flags: {},
        args: {}
      });
    });

    it('should return an arg tree with kwargs, flags, and args', function () {
      var boundCollect = collect.bind(null, 'node', 'browserify',
        ['--transform', 'babelify', '--verbose', '--outfile=build/index.js', 'src/index.js']);

      // With nested nodes
      var result = boundCollect(
        Arg(
          'input'
        ),
        Flag(
          'verbose'
        ),
        KWArg(
          'outfile'
        ),
        KWArg(
          'transform'
        )
      );

      expect(result).to.eql({
        command: null,
        kwargs: {
          transform: 'babelify',
          outfile: 'build/index.js'
        },
        flags: {
          verbose: true
        },
        args: {
          input: 'src/index.js'
        }
      });
    });

    it('should return an arg tree from aliases', function () {
      var boundCollect = collect.bind(null, 'node', 'browserify',
        ['b', '-t', 'babelify', '-v', '-o=build/index.js', 'src/index.js']);

      // With nested nodes
      var result = boundCollect(
        Command(
          'build',
          {alias: 'b'},
          Arg(
            'input'
          ),
          Flag(
            'verbose',
            {alias: 'v'}
          ),
          KWArg(
            'outfile',
            {alias: 'o'}
          ),
          KWArg(
            'transform',
            {alias: 't'}
          )
        )
      );

      expect(result).to.eql({
        command: {
          name: 'build',
          command: null,
          kwargs: {
            transform: 'babelify',
            outfile: 'build/index.js'
          },
          flags: {
            verbose: true
          },
          args: {
            input: 'src/index.js'
          }
        },
        kwargs: {},
        flags: {},
        args: {}
      });
    });

    it('should throw an error for duplicate kwargs', function () {
      var throwErrorStub = stub(utils, 'throwError');
      var anError = /duplicate/i;

      var boundCollect = collect.bind(null, 'node', 'test',
        ['--kwarg=correct', '--kwarg=incorrect', 'correct', 'incorrect']);

      // With nested nodes
      boundCollect(
        Arg(
          'arg'
        ),
        KWArg(
          'kwarg'
        )
      );

      expect(throwErrorStub).to.have.been.calledWithMatch(anError);

      throwErrorStub.restore();
    });

  });

})();
