/* global describe, beforeEach, afterEach, it */

'use strict';

(function () {

  var expect = require('chai').expect;
  var sinon = require('sinon');
  var stub = sinon.stub;
  var spy = sinon.spy;

  var collect = require('../src/collect');
  var Program = require('../src/program');
  var Command = require('../src/command');
  var KWArg = require('../src/kwarg');
  var Flag = require('../src/flag');
  var Arg = require('../src/arg');
  var Required = require('../src/required');
  // var RequireAll = require('../src/require-all');
  // var RequireAny = require('../src/require-any');
  var utils = require('../src/utils');

  describe('collect.js', function () {

    function throwError (error) {
      throw new Error(error);
    }

    var exitWithHelpStub;

    beforeEach(function () {
      exitWithHelpStub = stub(utils, 'exitWithHelp', throwError);
    });

    afterEach(function () {
      exitWithHelpStub.restore();
    });

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

    it('should throw an error if there is more than one root node', function () {
      var anError = /single/i;

      var boundCollect = collect.bind(null, 'node', 'npm', [], Program('test'), Program('test'));

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
      var boundCollect = collect.bind(null, 'node', 'browserify', ['command', 'command']);

      var result = boundCollect(
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
      var boundCollect = collect.bind(null, 'node', 'browserify', ['not-a-command']);

      var result = boundCollect(
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

    it('should call program and command callbacks if matched', function () {
      var boundCollect = collect.bind(null, 'node', 'browserify', ['argy', 'command2', 'argygain', 'command3']);

      var programSpy = spy();
      var command1Spy = spy();
      var command2Spy = spy();
      var command3Spy = spy();

      var result = boundCollect(
        Program(
          'program',
          {callback: programSpy},
          Arg(
            'arg1'
          ),
          Command(
            'command1',
            {callback: command1Spy},
            Arg(
              'arg3'
            )
          ),
          Command(
            'command2',
            {callback: command2Spy},
            Arg(
              'arg2'
            ),
            Command(
              'command3',
              {callback: command3Spy}
            )
          )
        )
      );

      expect(programSpy).to.have.been.calledOnce;
      expect(programSpy).to.have.been.calledWith(result);
      expect(command2Spy).to.have.been.calledOnce;
      expect(command2Spy).to.have.been.calledWith(result.command);
      expect(command3Spy).to.have.been.calledOnce;
      expect(command3Spy).to.have.been.calledWith(result.command.command);
      expect(command1Spy).not.to.have.been.called;

      expect(result.args.arg1).to.equal('argy');
      expect(result.command.args.arg2).to.equal('argygain');
    });

    it('should return an arg tree from aliases', function () {
      var boundCollect = collect.bind(null, 'node', 'browserify',
        ['b', '-t', 'babelify', '-v', '-o', 'build/index.js', 'src/index.js']);

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

    it('should exit with help for no kwarg value (equals)', function () {
      var anError = /value.*\n\n/i;

      var boundCollect = collect.bind(null, 'node', 'test', ['--kwarg=', 'invalid']);
      boundCollect = boundCollect.bind(
        null,
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

      // With nested nodes
      expect(boundCollect).to.throw(anError);
    });

    it('should exit with help for no kwarg value (not equals)', function () {
      var anError = /value.*\n\n/i;

      var boundCollect = collect.bind(null, 'node', 'test', ['--kwarg']);
      boundCollect = boundCollect.bind(
        null,
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

      // With nested nodes
      expect(boundCollect).to.throw(anError);
    });

    it('should exit with help for invalid alias syntax', function () {
      var anError = /syntax.*\n\n/i;

      var boundCollect = collect.bind(null, 'node', 'test', ['-k=invalid']);
      boundCollect = boundCollect.bind(
        null,
        Program(
          'program',
          null,
          Arg(
            'arg'
          ),
          KWArg(
            'kwarg',
            {
              alias: 'k'
            }
          )
        )
      );

      expect(boundCollect).to.throw(anError);
    });

    it('should exit with help for duplicate kwargs', function () {
      var anError = /duplicate.*\n\n/i;

      var boundCollect = collect.bind(null, 'node', 'test', ['--kwarg=correct', '--kwarg=incorrect']);

      var boundCollect = boundCollect.bind(
        null,
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

      expect(boundCollect).to.throw(anError);
    });

    it('should exit with help for duplicate flags', function () {
      var anError = /duplicate.*\n\n/i;

      var boundCollect = collect.bind(null, 'node', 'test', ['--flag', '--flag']);

      boundCollect = boundCollect.bind(
        null,
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

      expect(boundCollect).to.throw(anError);
    });

    it('should exit with help for duplicate flag aliases', function () {
      var anError = /duplicate.*\n\n/i;

      var boundCollect = collect.bind(null, 'node', 'test', ['--flag', '-f']);

      boundCollect = boundCollect.bind(
        null,
        Program(
          'program',
          null,
          Arg(
            'arg'
          ),
          Flag(
            'flag',
            {
              alias: 'f'
            }
          )
        )
      );

      expect(boundCollect).to.throw(anError);
    });

    it('should exit with help for unknown flags / kwargs', function () {
      var anError = /unknown.*\n\n/i;

      var boundCollect = collect.bind(null, 'node', 'test', ['--version']);

      boundCollect = boundCollect.bind(
        null,
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

      expect(boundCollect).to.throw(anError);
    });

    it('should exit with help for unknown flag / kwarg aliases', function () {
      var anError = /unknown.*\n\n/i;

      var boundCollect = collect.bind(null, 'node', 'test', ['-v']);

      boundCollect = boundCollect.bind(
        null,
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

      expect(boundCollect).to.throw(anError);
    });

    it('should exit with help for unknown commands / args', function () {
      var anError = /unknown.*\n\n/i;

      var boundCollect = collect.bind(null, 'node', 'test', ['another-command']);

      boundCollect = boundCollect.bind(
        null,
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

      expect(boundCollect).to.throw(anError);
    });

    it('should return an arg tree with kwarg aliases', function () {
      var boundCollect = collect.bind(null, 'node', 'test', ['-kthing', '-athing']);

      var tree = boundCollect(
        Program(
          'program',
          null,
          KWArg(
            'kwarg',
            {
              alias: 'k'
            }
          ),
          KWArg(
            'another-kwarg',
            {
              alias: 'a'
            }
          )
        )
      );

      expect(tree).to.eql({
        command: null,
        kwargs: {
          kwarg: 'thing',
          'another-kwarg': 'thing'
        },
        flags: {},
        args: {}
      });

      boundCollect = collect.bind(null, 'node', 'test', ['-k', 'thing', '-a', 'thing']);

      tree = boundCollect(
        Program(
          'program',
          null,
          KWArg(
            'kwarg',
            {
              alias: 'k'
            }
          ),
          KWArg(
            'another-kwarg',
            {
              alias: 'a'
            }
          )
        )
      );

      expect(tree).to.eql({
        command: null,
        kwargs: {
          kwarg: 'thing',
          'another-kwarg': 'thing'
        },
        flags: {},
        args: {}
      });
    });

    it('should return an arg tree with flag aliases', function () {
      var boundCollect = collect.bind(null, 'node', 'test', ['-f', '-a']);

      var tree = boundCollect(
        Program(
          'program',
          null,
          Flag(
            'flag',
            {
              alias: 'f'
            }
          ),
          Flag(
            'another-flag',
            {
              alias: 'a'
            }
          )
        )
      );

      expect(tree).to.eql({
        command: null,
        kwargs: {},
        flags: {
          flag: true,
          'another-flag': true
        },
        args: {}
      });

      boundCollect = collect.bind(null, 'node', 'test', ['-fa']);

      tree = boundCollect(
        Program(
          'program',
          null,
          Flag(
            'flag',
            {
              alias: 'f'
            }
          ),
          Flag(
            'another-flag',
            {
              alias: 'a'
            }
          )
        )
      );

      expect(tree).to.eql({
        command: null,
        kwargs: {},
        flags: {
          flag: true,
          'another-flag': true
        },
        args: {}
      });
    });

    it('should exit with help for invalid chained flag aliases', function () {
      var anError = /invalid.*\n\n/i;

      var boundCollect = collect.bind(null, 'node', 'test', ['-fk']);

      boundCollect = boundCollect.bind(
        null,
        Program(
          'program',
          null,
          Flag(
            'flag',
            {
              alias: 'f'
            }
          ),
          KWArg(
            'kwarg',
            {
              alias: 'k'
            }
          )
        )
      );

      expect(boundCollect).to.throw(anError);
    });

    it('should exit with help for missing required Commands', function () {
      var anError = /command\swas\snot\ssupplied\n\n/i;

      var boundCollect = collect.bind(null, 'node', 'test', []);

      boundCollect = boundCollect.bind(
        null,
        Program(
          'program',
          null,
          Required(
            Command('command')
          )
        )
      );

      expect(boundCollect).to.throw(anError);
    });

    it('should exit with help for missing required Args', function () {
      var anError = /arg\swas\snot\ssupplied\n\n/i;

      var boundCollect = collect.bind(null, 'node', 'test', ['command']);

      boundCollect = boundCollect.bind(
        null,
        Program(
          'program',
          null,
          Command(
            'command',
            null,
            Required(
              Arg('arg')
            )
          )
        )
      );

      expect(boundCollect).to.throw(anError);
    });

  });

})();
