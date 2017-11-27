/* global describe, beforeEach, afterEach, it, xit */

'use strict';

(function () {

  var expect = require('chai').expect;
  var sinon = require('sinon');
  var stub = sinon.stub;
  var spy = sinon.spy;

  var collect = require('../src/collect');
  var Help = require('../src/help');
  var Program = require('../src/program');
  var Command = require('../src/command');
  var KWArg = require('../src/kwarg');
  var Flag = require('../src/flag');
  var Arg = require('../src/arg');
  var Required = require('../src/required');
  var RequireAll = require('../src/require-all');
  var RequireAny = require('../src/require-any');
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

      // Without tree
      expect(collect).to.throw(anError);

    });

    it('should throw an error if root node is not a Program', function () {
      var anError = /program/i;

      var boundCollect = collect.bind(null, Arg('test'));

      // Without tree
      expect(boundCollect).to.throw(anError);

    });

    it('should throw an error if there is more than one root node', function () {
      var anError = /too many arguments/i;

      var boundCollect = collect.bind(null, Program('test'), [], Program('test'));

      // Without tree
      expect(boundCollect).to.throw(anError);

    });

    it('should throw an error if the argv is undefined', function () {
      var anError = /no argv supplied/i;

      var boundCollect = collect.bind(null, Program('test'));

      expect(boundCollect).to.throw(anError);
    });

    it('should throw an error if the second argument is not an argv', function () {
      var anError = /argv must be an array of strings/i;

      var boundCollect = collect.bind(null, Program('test'), 'nope');

      expect(boundCollect).to.throw(anError);
    });

    it('should return an arg tree when no args provided', function () {
      // With tree
      var result = collect(
        Program(
          'program',
          null,
          Command(
            'install'
          )
        ),
        []
      );

      expect(result).to.eql({
        name: 'program',
        command: null,
        kwargs: {},
        flags: {},
        args: {}
      });

    });

    it('should return an arg tree for single command schema', function () {
      // With single node
      var result = collect(
        Program(
          'program',
          null,
          Command(
            'install'
          )
        ),
        ['install']
      );

      expect(result).to.eql({
        name: 'program',
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
      // With nested nodes
      var result = collect(
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
        ),
        ['install', 'jargs']
      );

      expect(result).to.eql({
        name: 'program',
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
      // With nested nodes
      var result = collect(
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
        ),
        ['install', 'jargs', '--save']
      );

      expect(result).to.eql({
        name: 'program',
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
      // With nested nodes
      var result = collect(
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
        ),
        ['--transform', 'babelify', '--verbose', '--outfile=build/index.js', 'src/index.js']
      );

      expect(result).to.eql({
        name: 'program',
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
      var result = collect(
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
        ),
        ['command', 'command']
      );

      expect(result).to.eql({
        name: 'program',
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
      var result = collect(
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
        ),
        ['not-a-command']
      );

      expect(result).to.eql({
        name: 'program',
        command: null,
        kwargs: {},
        flags: {},
        args: {
          arg1: 'not-a-command'
        }
      });
    });

    it('should call program and command callbacks if matched', function () {
      var programSpy = spy();
      var command1Spy = spy();
      var command2Spy = spy();
      var command3Spy = spy();

      var result = collect(
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
        ),
        ['argy', 'command2', 'argygain', 'command3']
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

    it('should pass parent tree & returned value to subsequent callbacks', function () {
      var programSpy = stub().returns(1);
      var command1Spy = stub().returns(2);
      var command2Spy = stub().returns(3);
      var command3Spy = stub().returns(4);

      var result = collect(
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
        ),
        ['argy', 'command2', 'argygain', 'command3']
      );

      expect(programSpy).to.have.been.calledOnce;
      expect(programSpy).to.have.been.calledWith(result, undefined, undefined);
      expect(command2Spy).to.have.been.calledOnce;
      expect(command2Spy).to.have.been.calledWith(result.command, result, 1);
      expect(command3Spy).to.have.been.calledOnce;
      expect(command3Spy).to.have.been.calledWith(result.command.command, result.command, 3);
      expect(command1Spy).not.to.have.been.called;
    });

    it('should return an arg tree from aliases', function () {
      // With nested nodes
      var result = collect(
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
        ),
        ['b', '-t', 'babelify', '-v', '-o', 'build/index.js', 'src/index.js']
      );

      expect(result).to.eql({
        name: 'program',
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

      var boundCollect = collect.bind(
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
        ),
        ['--kwarg=', 'invalid']
      );

      // With nested nodes
      expect(boundCollect).to.throw(anError);
    });

    it('should exit with help for no kwarg value (not equals)', function () {
      var anError = /value.*\n\n/i;

      var boundCollect = collect.bind(
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
        ),
        ['--kwarg']
      );

      // With nested nodes
      expect(boundCollect).to.throw(anError);
    });

    it('should exit with help for invalid alias syntax', function () {
      var anError = /syntax.*\n\n/i;

      var boundCollect = collect.bind(
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
        ),
        ['-k=invalid']
      );

      expect(boundCollect).to.throw(anError);
    });

    it('should exit with help for duplicate kwargs', function () {
      var anError = /duplicate.*\n\n/i;

      var boundCollect = collect.bind(
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
        ),
        ['--kwarg=correct', '--kwarg=incorrect']
      );

      expect(boundCollect).to.throw(anError);
    });

    it('should exit with help for duplicate flags', function () {
      var anError = /duplicate.*\n\n/i;

      var boundCollect = collect.bind(
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
        ),
        ['--flag', '--flag']
      );

      expect(boundCollect).to.throw(anError);
    });

    it('should exit with help for duplicate flag aliases', function () {
      var anError = /duplicate.*\n\n/i;

      var boundCollect = collect.bind(
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
        ),
        ['--flag', '-f']
      );

      expect(boundCollect).to.throw(anError);
    });

    it('should exit with help for unknown flags / kwargs', function () {
      var anError = /unknown.*\n\n/i;

      var boundCollect = collect.bind(
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
        ),
        ['--version']
      );

      expect(boundCollect).to.throw(anError);
    });

    it('should exit with help for unknown flag / kwarg aliases', function () {
      var anError = /unknown.*\n\n/i;

      var boundCollect = collect.bind(
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
        ),
        ['-v']
      );

      expect(boundCollect).to.throw(anError);
    });

    it('should exit with help for unknown commands / args', function () {
      var anError = /unknown.*\n\n/i;

      var boundCollect = collect.bind(
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
        ),
        ['another-command']
      );

      expect(boundCollect).to.throw(anError);
    });

    it('should return an arg tree with kwarg aliases', function () {
      var tree = collect(
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
        ),
        ['-kthing', '-athing']
      );

      expect(tree).to.eql({
        name: 'program',
        command: null,
        kwargs: {
          kwarg: 'thing',
          'another-kwarg': 'thing'
        },
        flags: {},
        args: {}
      });

      tree = collect(
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
        ),
        ['-k', 'thing', '-a', 'thing']
      );

      expect(tree).to.eql({
        name: 'program',
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
      var tree = collect(
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
        ),
        ['-f', '-a']
      );

      expect(tree).to.eql({
        name: 'program',
        command: null,
        kwargs: {},
        flags: {
          flag: true,
          'another-flag': true
        },
        args: {}
      });

      tree = collect(
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
        ),
        ['-fa']
      );

      expect(tree).to.eql({
        name: 'program',
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

      var boundCollect = collect.bind(
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
        ),
        ['-fk']
      );

      expect(boundCollect).to.throw(anError);
    });

    it('should exit with help for missing required Commands', function () {
      var anError = /command\swas\snot\ssupplied\n\n/i;

      var boundCollect = collect.bind(
        null,
        Program(
          'program',
          null,
          Required(
            Command('command')
          )
        ),
        []
      );

      expect(boundCollect).to.throw(anError);
    });

    it('should exit with help for missing required Commands when other Command found', function () {
      var anError = /required\swas\snot\ssupplied\n\n/i;

      var boundCollect = collect.bind(
        null,
        Program(
          'program',
          null,
          Command(
            'not-required'
          ),
          Required(
            Command('required')
          )
        ),
        ['not-required']
      );

      expect(boundCollect).to.throw(anError);
    });

    it('should exit with help for missing required Args', function () {
      var anError = /arg\swas\snot\ssupplied\n\n/i;

      var boundCollect = collect.bind(
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
        ),
        ['command']
      );

      expect(boundCollect).to.throw(anError);
    });

    it('should exit with help for missing require any Commands', function () {
      var anError = /command1,\scommand2\n\n/i;

      var boundCollect = collect.bind(
        null,
        Program(
          'program',
          null,
          RequireAny(
            Command('command1'),
            Command('command2')
          )
        ),
        []
      );

      expect(boundCollect).to.throw(anError);
    });

    it('should exit with help for missing require any Commands when other Command found', function () {
      var anError = /required1,\srequired2\n\n/i;

      var boundCollect = collect.bind(
        null,
        Program(
          'program',
          null,
          Command(
            'not-required'
          ),
          RequireAny(
            Command('required1'),
            Command('required2')
          )
        ),
        ['not-required']
      );

      expect(boundCollect).to.throw(anError);
    });

    it('should exit with help for missing require any Args', function () {
      var anError = /arg1,\sarg2\n\n/i;

      var boundCollect = collect.bind(
        null,
        Program(
          'program',
          null,
          Command(
            'command',
            null,
            RequireAny(
              Arg('arg1'),
              Arg('arg2')
            )
          )
        ),
        ['command']
      );

      expect(boundCollect).to.throw(anError);
    });

    it('should not error when all required arguments are met', function () {
      var anError = /required/i;

      var boundCollect = collect.bind(
        null,
        Program(
          'program',
          null,
          Required(
            Command(
              'command',
              null,
              RequireAny(
                KWArg(
                  'kwarg1'
                ),
                KWArg(
                  'kwarg2'
                )
              ),
              RequireAll(
                Arg('arg1'),
                Arg('arg2')
              )
            )
          )
        ),
        ['command', '--kwarg1=value', 'arg1', 'arg2']
      );

      expect(boundCollect).not.to.throw(anError);
    });

    it('should display help info if a global help node is present (root)', function () {
      var anError = /Usage:\sprogram(.|\n)*description\n\n/;

      var boundCollect = collect.bind(
        null,
        Help(
          'help',
          {
            alias: 'h',
            description: 'description'
          },
          Program(
            'program',
            {
              usage: 'program'
            },
            Required(
              Command(
                'command',
                {
                  usage: 'command'
                }
              )
            )
          )
        ),
        ['--help']
      );

      expect(boundCollect).to.throw(anError);
    });

    it('should display help info if a global help node is present (nested)', function () {
      var anError = /Usage:\scommand(.|\n)*description\n\n/;

      var boundCollect = collect.bind(
        null,
        Help(
          'help',
          {
            alias: 'h',
            description: 'description'
          },
          Program(
            'program',
            {
              usage: 'program'
            },
            Required(
              Command(
                'command',
                {
                  usage: 'command'
                }
              )
            )
          )
        ),
        ['command', '--help']
      );

      expect(boundCollect).to.throw(anError);
    });

    it('should display help info if a global help node is present (alias)', function () {
      var anError = /description\n\n$/i;

      var boundCollect = collect.bind(
        null,
        Help(
          'help',
          {
            alias: 'h',
            description: 'description'
          },
          Program(
            'program',
            null,
            Required(
              Command(
                'command'
              )
            )
          )
        ),
        ['command', '-h']
      );

      expect(boundCollect).to.throw(anError);
    });

    it('should not display help info if a global help node is present but another node is matched', function () {
      var anError = /description\n\n$/i;

      var boundCollect = collect.bind(
        null,
        Help(
          'help',
          {
            alias: 'h',
            description: 'description'
          },
          Program(
            'program',
            null,
            Required(
              Command(
                'command',
                null,
                Flag(
                  'help',
                  {
                    alias: 'h'
                  }
                )
              )
            )
          )
        ),
        ['command', '--help']
      );

      expect(boundCollect).not.to.throw(anError);
    });

    it('should not display help info if a global help node is present but another node is matched (alias', function () {
      var anError = /description\n\n$/i;

      var boundCollect = collect.bind(
        null,
        Help(
          'help',
          {
            alias: 'h',
            description: 'description'
          },
          Program(
            'program',
            null,
            Required(
              Command(
                'command',
                null,
                Flag(
                  'help',
                  {
                    alias: 'h'
                  }
                )
              )
            )
          )
        ),
        ['command', '-h']
      );

      expect(boundCollect).not.to.throw(anError);
    });

    xit('should collect multiple Arg values', function () {

    });

    xit('should collect multiple KWArg values', function () {

    });

  });

})();
