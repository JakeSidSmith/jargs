/* global describe, it */

'use strict';

(function () {

  var expect = require('chai').expect;
  var stub = require('sinon').stub;

  var collect = require('../src/collect');
  var Program = require('../src/program');
  var Command = require('../src/command');
  var KWArg = require('../src/kwarg');
  var Flag = require('../src/flag');
  var Arg = require('../src/arg');

  describe('collect.js', function () {

    it('should exist', function () {
      expect(collect).to.be.ok;
      expect(typeof collect).to.equal('function');
    });

    it('should throw an error if no Program provided', function () {
      var anError = /program/i;

      var boundCollect = collect.bind(null, 'node', 'npm', []);

      // Without tree
      expect(boundCollect).to.throw(anError);

    });

    it('should throw an error if root node is not a Program', function () {
      var anError = /program/i;

      var boundCollect = collect.bind(null, 'node', 'npm', [], Arg('test'));

      // Without tree
      expect(boundCollect).to.throw(anError);

    });

    it('should return an arg tree when no args provided', function () {
      var boundCollect = collect.bind(null, 'node', 'npm', []);

      // Without tree
      var result = boundCollect(
        Program(
          'program',
          null,
          Command(
            'install'
          )
        )
      );

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
        Program(
          'program',
          null,
          Command(
            'install'
          )
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
        Program(
          'program',
          null,
          Command(
            'install',
            null,
            Arg(
              'lib'
            )
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
        Program(
          'program',
          null,
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
        Program(
          'program',
          null,
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

    it('should prioritize commands and traverse their children (test 1)', function () {
      var result;
      var boundCollect = collect.bind(null, 'node', 'browserify', ['command', 'command']);

      result = boundCollect(
        Program(
          'program',
          null,
          Arg(
            'arg1'
          ),
          Command(
            'command',
            null,
            Arg(
              'arg2'
            )
          )
        )
      );

      expect(result).to.eql({
        command: {
          name: 'command',
          command: null,
          kwargs: {},
          flags: {},
          args: {
            arg2: 'command'
          }
        },
        kwargs: {},
        flags: {},
        args: {}
      });
    });

    it('should prioritize commands and traverse their children (test 2)', function () {
      var result;
      var boundCollect = collect.bind(null, 'node', 'browserify', ['not-a-command']);

      result = boundCollect(
        Program(
          'program',
          null,
          Arg(
            'arg1'
          ),
          Command(
            'command',
            null,
            Arg(
              'arg2'
            )
          )
        )
      );

      expect(result).to.eql({
        command: null,
        kwargs: {},
        flags: {},
        args: {
          arg1: 'not-a-command'
        }
      });
    });

    it('should return an arg tree from aliases', function () {
      var boundCollect = collect.bind(null, 'node', 'browserify',
        ['b', '-t', 'babelify', '-v', '-o=build/index.js', 'src/index.js']);

      // With nested nodes
      var result = boundCollect(
        Program(
          'program',
          null,
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

    it('should exit with help for duplicate kwargs', function () {
      var strerrStub = stub(process.stderr, 'write');
      var exitStub = stub(process, 'exit');
      var anError = /duplicate.*\n\n/i;

      var boundCollect = collect.bind(null, 'node', 'test',
        ['--kwarg=correct', '--kwarg=incorrect']);

      // With nested nodes
      boundCollect(
        Program(
          'program',
          null,
          Arg(
            'arg'
          ),
          KWArg(
            'kwarg'
          )
        )
      );

      expect(strerrStub).to.have.been.calledWithMatch(anError);

      strerrStub.restore();
      exitStub.restore();
    });

    it('should exit with help for duplicate flags', function () {
      var strerrStub = stub(process.stderr, 'write');
      var exitStub = stub(process, 'exit');
      var anError = /duplicate.*\n\n/i;

      var boundCollect = collect.bind(null, 'node', 'test',
        ['--flag', '--flag']);

      // With nested nodes
      boundCollect(
        Program(
          'program',
          null,
          Arg(
            'arg'
          ),
          Flag(
            'flag'
          )
        )
      );

      expect(strerrStub).to.have.been.calledWithMatch(anError);

      strerrStub.restore();
      exitStub.restore();
    });

    it('should exit with help for unknown flags / kwargs', function () {
      var strerrStub = stub(process.stderr, 'write');
      var exitStub = stub(process, 'exit');
      var anError = /unknown.*\n\n/i;

      var boundCollect = collect.bind(null, 'node', 'test',
        ['--version']);

      // With nested nodes
      boundCollect(
        Program(
          'program',
          null,
          Arg(
            'arg'
          ),
          Flag(
            'flag'
          ),
          KWArg(
            'kwarg'
          )
        )
      );

      expect(strerrStub).to.have.been.calledWithMatch(anError);

      strerrStub.restore();
      exitStub.restore();
    });

    it('should exit with help for unknown commands / args', function () {
      var strerrStub = stub(process.stderr, 'write');
      var exitStub = stub(process, 'exit');
      var anError = /unknown.*\n\n/i;

      var boundCollect = collect.bind(null, 'node', 'test',
        ['another-command']);

      // With nested nodes
      boundCollect(
        Program(
          'program',
          null,
          Command(
            'command'
          ),
          Flag(
            'flag'
          ),
          KWArg(
            'kwarg'
          )
        )
      );

      expect(strerrStub).to.have.been.calledWithMatch(anError);

      strerrStub.restore();
      exitStub.restore();
    });

  });

})();
