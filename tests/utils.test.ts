import { Arg } from '../src/arg';
import { Command } from '../src/command';
import { Flag } from '../src/flag';
import { Help } from '../src/help';
import { KWArg } from '../src/kwarg';
import { Program } from '../src/program';
import { CommandNode, ProgramOrCommandChildren } from '../src/types';
import * as utils from '../src/utils';

describe('utils.js', () => {
  it('should exist', () => {
    expect(utils).toBeTruthy();
  });

  describe('several', () => {
    const arr = [1, 2, 3, 4, 5];

    it('should return true if several items match the predicate', () => {
      expect(
        utils.several(arr, function (value) {
          return value > 3;
        })
      ).toBe(true);

      expect(
        utils.several(arr, function (value) {
          return value === 1;
        })
      ).toBe(false);
    });
  });

  describe('sum', () => {
    it('should sum the values in an array', () => {
      expect(utils.sum([1, 2, 3, 4])).toBe(10);
      expect(utils.sum([1, 2, 3, 4, 5])).toBe(15);
      expect(utils.sum([3, 4, 2])).toBe(9);
    });
  });

  describe('sortByName', () => {
    it('should sort some nodes by name', () => {
      const nodes = [
        { name: 'c' },
        { name: 'a' },
        { name: 'b' },
        { name: 'd' },
        { name: 'a' },
        { name: 'e' },
      ];

      expect(nodes.sort(utils.sortByName)).toEqual([
        { name: 'a' },
        { name: 'a' },
        { name: 'b' },
        { name: 'c' },
        { name: 'd' },
        { name: 'e' },
      ]);
    });
  });

  describe('createHelp', () => {
    it('should create a basic error message', () => {
      const schema = Command('test');
      const error = 'An error';

      const expected = ['', '  An error', '', ''].join('\n');

      expect(utils.createHelp(schema, {}, error)).toBe(expected);
    });

    it('should create help with usage text', () => {
      const schema = Command('test', { usage: 'How to use' });
      const error = 'An error';

      const expected = [
        '',
        '  Usage: How to use',
        '',
        '  An error',
        '',
        '',
      ].join('\n');

      expect(utils.createHelp(schema, {}, error)).toBe(expected);
    });

    it('should create help with commands text', () => {
      const schema = Command(
        'test',
        null,
        Command('sub', { alias: 's', description: 'Description' })
      );
      const error = 'An error';

      const expected = [
        '',
        '  Commands:',
        '    sub, s  Description',
        '',
        '  An error',
        '',
        '',
      ].join('\n');

      const result = utils.createHelp(schema, {}, error);

      expect(result).toBe(expected);
    });

    it('should create help with options text', () => {
      const schema = Command(
        'test',
        null,
        Arg('arg', { description: 'Desc 1' }),
        Flag('flag', { alias: 'f', description: 'Desc 2' })
      );
      const error = 'An error';

      const expected = [
        '',
        '  Options:',
        '    --flag, -f  Desc 2',
        '    <arg>       Desc 1',
        '',
        '  An error',
        '',
        '',
      ].join('\n');

      expect(utils.createHelp(schema, {}, error)).toBe(expected);
    });

    it('should create help with global help option', () => {
      const schema = Help(
        'help',
        {
          alias: 'h',
          description: 'Display help and usage',
        },
        Program(
          'program',
          null,
          Command(
            'test',
            null,
            Arg('arg', { description: 'Desc 1' }),
            Flag('flag', { alias: 'f', description: 'Desc 2' })
          )
        )
      );
      const error = 'An error';

      const expected = [
        '',
        '  Options:',
        '    --flag, -f  Desc 2',
        '    --help, -h  Display help and usage',
        '    <arg>       Desc 1',
        '',
        '  An error',
        '',
        '',
      ].join('\n');

      expect(
        utils.createHelp(
          schema.children[0] as CommandNode<string, ProgramOrCommandChildren>,
          schema._globals,
          error
        )
      ).toBe(expected);
    });

    it('should create help with global help option (overridden)', () => {
      const schema = Help(
        'help',
        {
          alias: 'h',
          description: 'Display help and usage',
        },
        Program(
          'program',
          null,
          Command(
            'test',
            null,
            Flag('help', {
              alias: 'h',
              description: 'Display help and usage (overridden)',
            }),
            Arg('arg', { description: 'Desc 1' }),
            Flag('flag', { alias: 'f', description: 'Desc 2' })
          )
        )
      );
      const error = 'An error';

      const expected = [
        '',
        '  Options:',
        '    --flag, -f  Desc 2',
        '    --help, -h  Display help and usage (overridden)',
        '    <arg>       Desc 1',
        '',
        '  An error',
        '',
        '',
      ].join('\n');

      expect(
        utils.createHelp(
          schema.children[0] as CommandNode<string, ProgramOrCommandChildren>,
          schema._globals,
          error
        )
      ).toBe(expected);
    });

    it('should create help with options text with types', () => {
      const schema = Command(
        'test',
        null,
        Arg('arg', { description: 'Desc 1', type: 'string' }),
        KWArg('kwarg', { alias: 'k', description: 'Desc 2', type: 'number' })
      );
      const error = 'An error';

      const expected = [
        '',
        '  Options:',
        '    --kwarg, -k  Desc 2                                                 [number]',
        '    <arg>        Desc 1                                                 [string]',
        '',
        '  An error',
        '',
        '',
      ].join('\n');

      expect(utils.createHelp(schema, {}, error)).toBe(expected);
    });

    it('should create help with examples text', () => {
      const schema = Command('test', { examples: ['Just like this'] });
      const error = 'An error';

      const expected = [
        '',
        '  Examples:',
        '    Just like this',
        '',
        '  An error',
        '',
        '',
      ].join('\n');

      expect(utils.createHelp(schema, {}, error)).toBe(expected);
    });

    it('should create some complex help text', () => {
      const schema = Command(
        'test',
        {
          alias: 't',
          description: 'A command',
          usage: 'Used like this',
          examples: ['Example 1', 'Example 2'],
        },
        Arg('arg', { description: 'Desc 1', type: 'string' }),
        Flag('flag', { alias: 'f', description: 'Desc 2' }),
        KWArg('kwarg', {
          alias: 'k',
          description: 'Desc 3',
          type: 'boolean',
        }),
        Command('sub', { description: 'A sub command' })
      );
      const error = 'An error';

      const expected = [
        '',
        '  Usage: Used like this',
        '',
        '  Commands:',
        '    sub  A sub command',
        '',
        '  Options:',
        '    --flag, -f   Desc 2',
        '    --kwarg, -k  Desc 3                                                [boolean]',
        '    <arg>        Desc 1                                                 [string]',
        '',
        '  Examples:',
        '    Example 1',
        '    Example 2',
        '',
        '  An error',
        '',
        '',
      ].join('\n');

      expect(utils.createHelp(schema, {}, error)).toBe(expected);
    });
  });

  describe('formatTable', () => {
    it('should format a table with 2 columns, and wrap the last column (commands)', () => {
      const table = [
        ['build', 'Build your project'],
        [
          'install, i',
          'Install new dependencies, or dependencies saved in your package.json',
        ],
      ];

      const expected = [
        '    build       Build your project',
        '    install, i  Install new dependencies, or dependencies saved in your',
        '                package.json',
      ].join('\n');

      const result = utils.formatTable(table, { alignRight: [], wrap: [1] });

      expect(result).toBe(expected);
    });

    it('should format a table with 3 columns, and wrap the 2nd column (options)', () => {
      const table = [
        ['--help', 'Display help & usage information', ''],
        [
          '--transform, -t',
          'Plugin to use when compiling your javascript blah blah blah',
          '[string]',
        ],
        ['--version, -v', 'Display version number', ''],
      ];

      const expected = [
        '    --help           Display help & usage information',
        '    --transform, -t  Plugin to use when compiling your javascript blah  [string]',
        '                     blah blah',
        '    --version, -v    Display version number',
      ].join('\n');

      const result = utils.formatTable(table, { alignRight: [2], wrap: [1] });

      expect(result).toBe(expected);
    });

    it('should format a table with 3 columns, and wrap the last 2, and right align the final column', () => {
      const table = [
        [
          'line1',
          'Some text that should be wrapped',
          'Some right aligned text that will be wrappped',
        ],
        [
          'line2, l2',
          'Some incidentally wrapped text',
          'Some right aligned text',
        ],
        ['line3, l3', 'No wrap', 'Right aligned'],
        [
          'line4, l4',
          'Another line of text that should be wrapped',
          "Some more right aligned text that will be wrapped onto 3 different lines because it's really quite long",
        ],
        [
          'line5, l5',
          'Ahyphenatedwordwillbewrapped',
          'Anotherhyphenatedwordwillbewrappedbuthastobelongerbecausethiscolumniswider',
        ],
      ];

      const expected = [
        '    line1      Some text that               Some right aligned text that will be',
        '               should be wrapped                                        wrappped',
        '    line2, l2  Some incidentally                         Some right aligned text',
        '               wrapped text',
        '    line3, l3  No wrap                                             Right aligned',
        '    line4, l4  Another line of         Some more right aligned text that will be',
        "               text that should be   wrapped onto 3 different lines because it's",
        '               wrapped                                         really quite long',
        '    line5, l5  Ahyphenatedwordwil-  Anotherhyphenatedwordwillbewrappedbuthastob-',
        '               lbewrapped                        elongerbecausethiscolumniswider',
      ].join('\n');

      const result = utils.formatTable(table, {
        alignRight: [2],
        wrap: [1, 2],
      });

      expect(result).toBe(expected);
    });

    it('should format a table with 3 columns and wrap them all', () => {
      const table = [
        [
          '40 character string la da da da da... da',
          'Another 40 character string la da da doo',
          'A super long 80 character string that will still be wrapped equal to the others!',
        ],
      ];

      // 80 - 4 - 2 - 2 = 72
      // 72 / 4 = 18
      // Column 1 & 2 get 18 chars, and column 3 gets 36

      const expected = [
        '    40 character        Another 40          A super long 80 character string',
        '    string la da da da  character string    that will still be wrapped equal to',
        '    da... da            la da da doo        the others!',
      ].join('\n');

      const result = utils.formatTable(table, {
        alignRight: [],
        wrap: [0, 1, 2],
      });

      expect(result).toBe(expected);
    });
  });

  describe('formatRequiredList', () => {
    it('should format node names in a list', () => {
      expect(utils.formatRequiredList([Arg('arg'), KWArg('kwarg')])).toBe(
        'arg, --kwarg'
      );
    });
  });

  describe('extractErrorMessage', () => {
    it('should return a string error message', () => {
      expect(utils.extractErrorMessage('foo')).toBe('foo');
      expect(utils.extractErrorMessage(123)).toBe('123');
      expect(utils.extractErrorMessage(new Error('foo'))).toBe('foo');
      expect(utils.extractErrorMessage(null)).toBe('An unknown error occurred');
    });
  });
});
