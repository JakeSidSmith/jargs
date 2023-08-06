import { Arg } from '../src/arg';
import { collect } from '../src/collect';
import { Command } from '../src/command';
import { Flag } from '../src/flag';
import { Help } from '../src/help';
import { KWArg } from '../src/kwarg';
import { Program } from '../src/program';
import { RequireAll } from '../src/require-all';
import { RequireAny } from '../src/require-any';
import { Required } from '../src/required';
import * as utils from '../src/utils';

describe('collect.js', () => {
  function throwError(error) {
    throw new Error(error);
  }

  const exitWithHelpStub = jest
    .spyOn(utils, 'exitWithHelp')
    .mockImplementation(throwError);

  afterEach(() => {
    exitWithHelpStub.mockClear();
  });

  it('should exist', () => {
    expect(collect).toBeTruthy();
    expect(typeof collect).toBe('function');
  });

  it('should throw an error if no Program provided', () => {
    let anError = /program/i;

    // Without tree
    expect(collect).toThrow(anError);
  });

  it('should throw an error if root node is not a Program', () => {
    let anError = /program/i;

    let boundCollect = collect.bind(null, Arg('test'));

    // Without tree
    expect(boundCollect).toThrow(anError);
  });

  it('should throw an error if there are too many arguments', () => {
    let anError = /too many arguments/i;

    let boundCollect = collect.bind(null, Program('test'), [], 'too many');

    // Without tree
    expect(boundCollect).toThrow(anError);
  });

  it('should throw an error if the argv is undefined', () => {
    let anError = /no argv supplied/i;

    let boundCollect = collect.bind(null, Program('test'));

    expect(boundCollect).toThrow(anError);
  });

  it('should throw an error if the second argument is not an argv', () => {
    let anError = /argv must be an array of strings/i;

    let boundCollect = collect.bind(null, Program('test'), 'nope');

    expect(boundCollect).toThrow(anError);
  });

  it('should throw an error if the argv has been modified', () => {
    let anError = /argv has been tampered with/i;

    let boundCollect = collect.bind(null, Program('test'), ['invalid']);

    expect(boundCollect).toThrow(anError);
  });

  it('should return an arg tree when no args provided', () => {
    // With tree
    let result = collect(Program('program', null, Command('install')), [
      'node',
      'program',
    ]);

    expect(result).toEqual({
      name: 'program',
      kwargs: {},
      flags: {},
      args: {},
    });
  });

  it('should return an arg tree for single command schema', () => {
    // With single node
    let result = collect(Program('program', null, Command('install')), [
      'node',
      'program',
      'install',
    ]);

    expect(result).toEqual({
      name: 'program',
      command: {
        name: 'install',
        kwargs: {},
        flags: {},
        args: {},
      },
      kwargs: {},
      flags: {},
      args: {},
    });
  });

  it('should return an arg tree with nested schema', () => {
    // With nested nodes
    let result = collect(
      Program('program', null, Command('install', null, Arg('lib'))),
      ['node', 'program', 'install', 'jargs']
    );

    expect(result).toEqual({
      name: 'program',
      command: {
        name: 'install',
        kwargs: {},
        flags: {},
        args: {
          lib: 'jargs',
        },
      },
      kwargs: {},
      flags: {},
      args: {},
    });
  });

  it('should return an arg tree with nested schema and flags', () => {
    // With nested nodes
    let result = collect(
      Program(
        'program',
        null,
        Command('install', null, Arg('lib'), Flag('save'))
      ),
      ['node', 'program', 'install', 'jargs', '--save']
    );

    expect(result).toEqual({
      name: 'program',
      command: {
        name: 'install',
        kwargs: {},
        flags: {
          save: true,
        },
        args: {
          lib: 'jargs',
        },
      },
      kwargs: {},
      flags: {},
      args: {},
    });
  });

  it('should return an arg tree with kwargs, flags, and args', () => {
    // With nested nodes
    let result = collect(
      Program(
        'program',
        null,
        Arg('input'),
        Flag('verbose'),
        KWArg('outfile'),
        KWArg('transform')
      ),
      [
        'node',
        'program',
        '--transform',
        'babelify',
        '--verbose',
        '--outfile=build/index.js',
        'src/index.js',
      ]
    );

    expect(result).toEqual({
      name: 'program',
      kwargs: {
        transform: 'babelify',
        outfile: 'build/index.js',
      },
      flags: {
        verbose: true,
      },
      args: {
        input: 'src/index.js',
      },
    });
  });

  it('should prioritize commands and traverse their children (test 1)', () => {
    let result = collect(
      Program(
        'program',
        null,
        Arg('arg1'),
        Command('command', null, Arg('arg2'))
      ),
      ['node', 'program', 'command', 'command']
    );

    expect(result).toEqual({
      name: 'program',
      command: {
        name: 'command',
        kwargs: {},
        flags: {},
        args: {
          arg2: 'command',
        },
      },
      kwargs: {},
      flags: {},
      args: {},
    });
  });

  it('should prioritize commands and traverse their children (test 2)', () => {
    let result = collect(
      Program(
        'program',
        null,
        Arg('arg1'),
        Command('command', null, Arg('arg2'))
      ),
      ['node', 'program', 'not-a-command']
    );

    expect(result).toEqual({
      name: 'program',
      kwargs: {},
      flags: {},
      args: {
        arg1: 'not-a-command',
      },
    });
  });

  it('should call program and command callbacks if matched', () => {
    let programSpy = jest.fn();
    let command1Spy = jest.fn();
    let command2Spy = jest.fn();
    let command3Spy = jest.fn();

    let result = collect(
      Program(
        'program',
        { callback: programSpy },
        Arg('arg1'),
        Command('command1', { callback: command1Spy }, Arg('arg3')),
        Command(
          'command2',
          { callback: command2Spy },
          Arg('arg2'),
          Command('command3', { callback: command3Spy })
        )
      ),
      ['node', 'program', 'argy', 'command2', 'argygain', 'command3']
    );

    expect(programSpy).toHaveBeenCalledTimes(1);
    expect(programSpy.mock.calls[0][0]).toEqual(result);
    expect(command2Spy).toHaveBeenCalledTimes(1);
    expect(command2Spy.mock.calls[0][0]).toEqual(result.command);
    expect(command3Spy).toHaveBeenCalledTimes(1);
    expect(command3Spy.mock.calls[0][0]).toEqual(result.command.command);
    expect(command1Spy).not.toHaveBeenCalled();

    expect(result.args.arg1).toBe('argy');
    expect(result.command.args.arg2).toBe('argygain');
  });

  it('should call program and commands with tree, parentTree, and returned value', () => {
    let programSpy = jest.fn().mockReturnValue(1);
    let command1Spy = jest.fn().mockReturnValue(2);
    let command2Spy = jest.fn().mockReturnValue(3);

    let expected = {
      name: 'program',
      kwargs: {},
      flags: {},
      args: {},
      command: {
        name: 'command1',
        kwargs: {},
        flags: {},
        args: {},
        command: {
          name: 'command2',
          kwargs: {},
          flags: {},
          args: {},
        },
      },
    };

    let result = collect(
      Program(
        'program',
        { callback: programSpy },
        Command(
          'command1',
          { callback: command1Spy },
          Command('command2', { callback: command2Spy })
        )
      ),
      ['node', 'program', 'command1', 'command2']
    );

    expect(result).toEqual(expected);

    expect(programSpy).toHaveBeenCalledTimes(1);
    expect(programSpy).toHaveBeenCalledWith(expected, undefined, undefined);
    expect(command1Spy).toHaveBeenCalledTimes(1);
    expect(command1Spy).toHaveBeenCalledWith(expected.command, expected, 1);
    expect(command2Spy).toHaveBeenCalledTimes(1);
    expect(command2Spy).toHaveBeenCalledWith(
      expected.command.command,
      expected.command,
      2
    );
  });

  it('should pass parent tree & returned value to subsequent callbacks', () => {
    let programSpy = jest.fn().mockReturnValue(1);
    let command1Spy = jest.fn().mockReturnValue(2);
    let command2Spy = jest.fn().mockReturnValue(3);
    let command3Spy = jest.fn().mockReturnValue(4);

    let result = collect(
      Program(
        'program',
        { callback: programSpy },
        Arg('arg1'),
        Command('command1', { callback: command1Spy }, Arg('arg3')),
        Command(
          'command2',
          { callback: command2Spy },
          Arg('arg2'),
          Command('command3', { callback: command3Spy })
        )
      ),
      ['node', 'program', 'argy', 'command2', 'argygain', 'command3']
    );

    expect(programSpy).toHaveBeenCalledTimes(1);
    expect(programSpy).toHaveBeenCalledWith(result, undefined, undefined);
    expect(command2Spy).toHaveBeenCalledTimes(1);
    expect(command2Spy).toHaveBeenCalledWith(result.command, result, 1);
    expect(command3Spy).toHaveBeenCalledTimes(1);
    expect(command3Spy).toHaveBeenCalledWith(
      result.command.command,
      result.command,
      3
    );
    expect(command1Spy).not.toHaveBeenCalled();
  });

  it('should return an arg tree from aliases', () => {
    // With nested nodes
    let result = collect(
      Program(
        'program',
        null,
        Command(
          'build',
          { alias: 'b' },
          Arg('input'),
          Flag('verbose', { alias: 'v' }),
          KWArg('outfile', { alias: 'o' }),
          KWArg('transform', { alias: 't' })
        )
      ),
      [
        'node',
        'program',
        'b',
        '-t',
        'babelify',
        '-v',
        '-o',
        'build/index.js',
        'src/index.js',
      ]
    );

    expect(result).toEqual({
      name: 'program',
      command: {
        name: 'build',
        kwargs: {
          transform: 'babelify',
          outfile: 'build/index.js',
        },
        flags: {
          verbose: true,
        },
        args: {
          input: 'src/index.js',
        },
      },
      kwargs: {},
      flags: {},
      args: {},
    });
  });

  it('should exit with help for no kwarg value (equals)', () => {
    let anError = /value.*\n\n/i;

    let boundCollect = collect.bind(
      null,
      Program('program', null, Arg('arg'), KWArg('kwarg')),
      ['node', 'program', '--kwarg=', 'invalid']
    );

    // With nested nodes
    expect(boundCollect).toThrow(anError);
  });

  it('should exit with help for no kwarg value (not equals)', () => {
    let anError = /value.*\n\n/i;

    let boundCollect = collect.bind(
      null,
      Program('program', null, Arg('arg'), KWArg('kwarg')),
      ['node', 'program', '--kwarg']
    );

    // With nested nodes
    expect(boundCollect).toThrow(anError);
  });

  it('should exit with help for invalid alias syntax', () => {
    let anError = /syntax.*\n\n/i;

    let boundCollect = collect.bind(
      null,
      Program(
        'program',
        null,
        Arg('arg'),
        KWArg('kwarg', {
          alias: 'k',
        })
      ),
      ['node', 'program', '-k=invalid']
    );

    expect(boundCollect).toThrow(anError);
  });

  it('should exit with help for duplicate kwargs', () => {
    let anError = /duplicate.*\n\n/i;

    let boundCollect = collect.bind(
      null,
      Program('program', null, Arg('arg'), KWArg('kwarg')),
      ['node', 'program', '--kwarg=correct', '--kwarg=incorrect']
    );

    expect(boundCollect).toThrow(anError);
  });

  it('should exit with help for duplicate flags', () => {
    let anError = /duplicate.*\n\n/i;

    let boundCollect = collect.bind(
      null,
      Program('program', null, Arg('arg'), Flag('flag')),
      ['node', 'program', '--flag', '--flag']
    );

    expect(boundCollect).toThrow(anError);
  });

  it('should exit with help for duplicate flag aliases', () => {
    let anError = /duplicate.*\n\n/i;

    let boundCollect = collect.bind(
      null,
      Program(
        'program',
        null,
        Arg('arg'),
        Flag('flag', {
          alias: 'f',
        })
      ),
      ['node', 'program', '--flag', '-f']
    );

    expect(boundCollect).toThrow(anError);
  });

  it('should exit with help for unknown flags / kwargs', () => {
    let anError = /unknown.*\n\n/i;

    let boundCollect = collect.bind(
      null,
      Program('program', null, Arg('arg'), Flag('flag'), KWArg('kwarg')),
      ['node', 'program', '--version']
    );

    expect(boundCollect).toThrow(anError);
  });

  it('should exit with help for unknown flag / kwarg aliases', () => {
    let anError = /unknown.*\n\n/i;

    let boundCollect = collect.bind(
      null,
      Program('program', null, Arg('arg'), Flag('flag'), KWArg('kwarg')),
      ['node', 'program', '-v']
    );

    expect(boundCollect).toThrow(anError);
  });

  it('should exit with help for unknown commands / args', () => {
    let anError = /unknown.*\n\n/i;

    let boundCollect = collect.bind(
      null,
      Program(
        'program',
        null,
        Command('command'),
        Flag('flag'),
        KWArg('kwarg')
      ),
      ['node', 'program', 'another-command']
    );

    expect(boundCollect).toThrow(anError);
  });

  it('should return an arg tree with kwarg aliases', () => {
    let tree = collect(
      Program(
        'program',
        null,
        KWArg('kwarg', {
          alias: 'k',
        }),
        KWArg('another-kwarg', {
          alias: 'a',
        })
      ),
      ['node', 'program', '-kthing', '-athing']
    );

    expect(tree).toEqual({
      name: 'program',
      kwargs: {
        kwarg: 'thing',
        'another-kwarg': 'thing',
      },
      flags: {},
      args: {},
    });

    tree = collect(
      Program(
        'program',
        null,
        KWArg('kwarg', {
          alias: 'k',
        }),
        KWArg('another-kwarg', {
          alias: 'a',
        })
      ),
      ['node', 'program', '-k', 'thing', '-a', 'thing']
    );

    expect(tree).toEqual({
      name: 'program',
      kwargs: {
        kwarg: 'thing',
        'another-kwarg': 'thing',
      },
      flags: {},
      args: {},
    });
  });

  it('should return an arg tree with flag aliases', () => {
    let tree = collect(
      Program(
        'program',
        null,
        Flag('flag', {
          alias: 'f',
        }),
        Flag('another-flag', {
          alias: 'a',
        })
      ),
      ['node', 'program', '-f', '-a']
    );

    expect(tree).toEqual({
      name: 'program',
      kwargs: {},
      flags: {
        flag: true,
        'another-flag': true,
      },
      args: {},
    });

    tree = collect(
      Program(
        'program',
        null,
        Flag('flag', {
          alias: 'f',
        }),
        Flag('another-flag', {
          alias: 'a',
        })
      ),
      ['node', 'program', '-fa']
    );

    expect(tree).toEqual({
      name: 'program',
      kwargs: {},
      flags: {
        flag: true,
        'another-flag': true,
      },
      args: {},
    });
  });

  it('should exit with help for invalid chained flag aliases', () => {
    let anError = /invalid.*\n\n/i;

    let boundCollect = collect.bind(
      null,
      Program(
        'program',
        null,
        Flag('flag', {
          alias: 'f',
        }),
        KWArg('kwarg', {
          alias: 'k',
        })
      ),
      ['node', 'program', '-fk']
    );

    expect(boundCollect).toThrow(anError);
  });

  it('should exit with help for missing required Commands', () => {
    let anError = /command\swas\snot\ssupplied\n\n/i;

    let boundCollect = collect.bind(
      null,
      Program('program', null, Required(Command('command'))),
      ['node', 'program']
    );

    expect(boundCollect).toThrow(anError);
  });

  it('should exit with help for missing required Commands when other Command found', () => {
    let anError = /required\swas\snot\ssupplied\n\n/i;

    let boundCollect = collect.bind(
      null,
      Program(
        'program',
        null,
        Command('not-required'),
        Required(Command('required'))
      ),
      ['node', 'program', 'not-required']
    );

    expect(boundCollect).toThrow(anError);
  });

  it('should exit with help for missing required Args', () => {
    let anError = /arg\swas\snot\ssupplied\n\n/i;

    let boundCollect = collect.bind(
      null,
      Program('program', null, Command('command', null, Required(Arg('arg')))),
      ['node', 'program', 'command']
    );

    expect(boundCollect).toThrow(anError);
  });

  it('should exit with help for missing require any Commands', () => {
    let anError = /command1,\scommand2\n\n/i;

    let boundCollect = collect.bind(
      null,
      Program(
        'program',
        null,
        RequireAny(Command('command1'), Command('command2'))
      ),
      ['node', 'program']
    );

    expect(boundCollect).toThrow(anError);
  });

  it('should exit with help for missing require any Commands when other Command found', () => {
    let anError = /required1,\srequired2\n\n/i;

    let boundCollect = collect.bind(
      null,
      Program(
        'program',
        null,
        Command('not-required'),
        RequireAny(Command('required1'), Command('required2'))
      ),
      ['node', 'program', 'not-required']
    );

    expect(boundCollect).toThrow(anError);
  });

  it('should exit with help for missing require any Args', () => {
    let anError = /arg1,\sarg2\n\n/i;

    let boundCollect = collect.bind(
      null,
      Program(
        'program',
        null,
        Command('command', null, RequireAny(Arg('arg1'), Arg('arg2')))
      ),
      ['node', 'program', 'command']
    );

    expect(boundCollect).toThrow(anError);
  });

  it('should not error when all required arguments are met', () => {
    let anError = /required/i;

    let boundCollect = collect.bind(
      null,
      Program(
        'program',
        null,
        Required(
          Command(
            'command',
            null,
            RequireAny(KWArg('kwarg1'), KWArg('kwarg2')),
            RequireAll(Arg('arg1'), Arg('arg2'))
          )
        )
      ),
      ['node', 'program', 'command', '--kwarg1=value', 'arg1', 'arg2']
    );

    expect(boundCollect).not.toThrow(anError);
  });

  it('should display help info if a global help node is present (root)', () => {
    let anError = /Usage:\sprogram(.|\n)*description\n\n/;

    let boundCollect = collect.bind(
      null,
      Help(
        'help',
        {
          alias: 'h',
          description: 'description',
        },
        Program(
          'program',
          {
            usage: 'program',
          },
          Required(
            Command('command', {
              usage: 'command',
            })
          )
        )
      ),
      ['node', 'program', '--help']
    );

    expect(boundCollect).toThrow(anError);
  });

  it('should display help info if a global help node is present (nested)', () => {
    let anError = /Usage:\scommand(.|\n)*description\n\n/;

    let boundCollect = collect.bind(
      null,
      Help(
        'help',
        {
          alias: 'h',
          description: 'description',
        },
        Program(
          'program',
          {
            usage: 'program',
          },
          Required(
            Command('command', {
              usage: 'command',
            })
          )
        )
      ),
      ['node', 'program', 'command', '--help']
    );

    expect(boundCollect).toThrow(anError);
  });

  it('should display help info if a global help node is present (alias)', () => {
    let anError = /description\n\n$/i;

    let boundCollect = collect.bind(
      null,
      Help(
        'help',
        {
          alias: 'h',
          description: 'description',
        },
        Program('program', null, Required(Command('command')))
      ),
      ['node', 'program', 'command', '-h']
    );

    expect(boundCollect).toThrow(anError);
  });

  it('should not display help info if a global help node is present but another node is matched', () => {
    let anError = /description\n\n$/i;

    let boundCollect = collect.bind(
      null,
      Help(
        'help',
        {
          alias: 'h',
          description: 'description',
        },
        Program(
          'program',
          null,
          Required(
            Command(
              'command',
              null,
              Flag('help', {
                alias: 'h',
              })
            )
          )
        )
      ),
      ['node', 'program', 'command', '--help']
    );

    expect(boundCollect).not.toThrow(anError);
  });

  it('should not display help info if a global help node is present but another node is matched (alias', () => {
    let anError = /description\n\n$/i;

    let boundCollect = collect.bind(
      null,
      Help(
        'help',
        {
          alias: 'h',
          description: 'description',
        },
        Program(
          'program',
          null,
          Required(
            Command(
              'command',
              null,
              Flag('help', {
                alias: 'h',
              })
            )
          )
        )
      ),
      ['node', 'program', 'command', '-h']
    );

    expect(boundCollect).not.toThrow(anError);
  });

  it('should collect multiple Arg values', () => {
    // With nested nodes
    let result = collect(
      Program(
        'program',
        null,
        Command(
          'install',
          null,
          Arg('lib', {
            multi: true,
          })
        )
      ),
      ['node', 'program', 'install', 'jargs', 'awesome']
    );

    expect(result).toEqual({
      name: 'program',
      command: {
        name: 'install',
        kwargs: {},
        flags: {},
        args: {
          lib: ['jargs', 'awesome'],
        },
      },
      kwargs: {},
      flags: {},
      args: {},
    });
  });

  it('should collect multiple KWArg values', () => {
    // With nested nodes
    const result1 = collect(
      Program(
        'program',
        null,
        Command(
          'install',
          null,
          KWArg('input', {
            multi: true,
          })
        )
      ),
      ['node', 'program', 'install', '--input', 'jargs', '--input=awesome']
    );

    expect(result1).toEqual({
      name: 'program',
      command: {
        name: 'install',
        kwargs: {
          input: ['jargs', 'awesome'],
        },
        flags: {},
        args: {},
      },
      kwargs: {},
      flags: {},
      args: {},
    });

    // With nested nodes
    const result2 = collect(
      Program(
        'program',
        null,
        Command(
          'install',
          null,
          KWArg('input', {
            alias: 'i',
            multi: true,
          })
        )
      ),
      ['node', 'program', 'install', '--input=jargs', '-i', 'awesome']
    );

    expect(result2).toEqual({
      name: 'program',
      command: {
        name: 'install',
        kwargs: {
          input: ['jargs', 'awesome'],
        },
        flags: {},
        args: {},
      },
      kwargs: {},
      flags: {},
      args: {},
    });
  });

  it('should collect rest arguments', () => {
    let result = collect(
      Program(
        'program',
        null,
        Command(
          'run',
          null,
          Required(Arg('command')),
          KWArg('env', {
            alias: 'e',
          })
        )
      ),
      [
        'node',
        'npm',
        'run',
        '--env=development',
        'manage.py',
        '--',
        'command',
        '--flag',
      ]
    );

    expect(result).toEqual({
      name: 'program',
      command: {
        name: 'run',
        kwargs: {
          env: 'development',
        },
        flags: {},
        args: {
          command: 'manage.py',
        },
        rest: ['command', '--flag'],
      },
      kwargs: {},
      flags: {},
      args: {},
    });
  });

  it('should error if required args are interrupted by --', () => {
    let anError = /required/i;

    let boundCollect = collect.bind(
      null,
      Program(
        'program',
        null,
        Command(
          'run',
          null,
          Required(Arg('command')),
          KWArg('env', {
            alias: 'e',
          })
        )
      ),
      [
        'node',
        'npm',
        'run',
        '--',
        '--env=development',
        'manage.py',
        'command',
        '--flag',
      ]
    );

    expect(boundCollect).toThrow(anError);
  });
});
