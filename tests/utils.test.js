/* global describe, it */

import { expect } from 'chai';

import { Arg } from '../src/arg';
import { Command } from '../src/command';
import { Flag } from '../src/flag';
import { Help } from '../src/help';
import { KWArg } from '../src/kwarg';
import { Program } from '../src/program';
import { RequireAll } from '../src/require-all';
import { RequireAny } from '../src/require-any';
import { Required } from '../src/required';
import * as utils from '../src/utils';

describe('utils.js', () => {
  it('should exist', () => {
    expect(utils).to.be.ok;
  });

  describe('argsToArray', () => {
    it('should convert arguments to an array', () => {
      function fn() {
        let args = utils.argsToArray(arguments);

        expect(Array.isArray(args)).to.be.true;
        expect(args).not.to.equal(arguments);
      }

      fn('foo', 'bar');
    });
  });

  describe('getNodeProperties', () => {
    it('should throw an error for invalid children', () => {
      let anError = /invalid/i;
      let child1 = Command('child1');
      let child2 = 'invalid';

      function fn() {
        utils.getNodeProperties(arguments, true);
      }

      expect(fn.bind(null, 'foo', { alias: 'bar' }, child1, child2)).to.throw(
        anError
      );
    });

    it('should throw an error for invalid types of children', () => {
      let anError = /invalid/i;
      let child1 = Command('child1');
      let child2 = Program('invalid');

      function fn() {
        utils.getNodeProperties(arguments, true);
      }

      expect(fn.bind(null, 'foo', { alias: 'bar' }, child1, child2)).to.throw(
        anError
      );
    });

    it(
      "should get a node's properties from the supplied arguments (with children)",
      () => {
        let child1 = Command('child1');
        let child2 = Command('child2');
        let child3 = Command('child3');

        function fn() {
          let properties = utils.getNodeProperties(arguments, true);

          expect(properties).to.be.ok;
          expect(properties).to.eql({
            name: 'foo',
            options: {
              alias: 'bar',
            },
            children: [child1, child2, child3],
            _requireAll: [],
            _requireAny: [],
          });
        }

        fn('foo', { alias: 'bar' }, child1, child2, child3);
      }
    );

    it(
      "should get a node's properties from the supplied arguments (with required children)",
      () => {
        let child1 = Arg('child1');
        let child2 = Arg('child2');
        let child3 = Arg('child3');
        let child4 = Arg('child4');
        let child5 = Arg('child5');
        let child6 = Arg('child6');
        let child7 = Arg('child7');

        function fn() {
          let properties = utils.getNodeProperties(arguments, true);

          expect(properties).to.be.ok;
          expect(properties).to.eql({
            name: 'foo',
            options: {
              alias: 'bar',
            },
            children: [child1, child2, child3, child4, child5, child6, child7],
            _requireAll: [child2, child3, child4],
            _requireAny: [[child5, child6]],
          });

          expect(properties.children[0]).to.equal(child1);
          expect(properties.children[3]).to.equal(child4);

          expect(properties._requireAll[1]).to.equal(child3);
          expect(properties._requireAny[0][0]).to.equal(child5);
        }

        fn(
          'foo',
          { alias: 'bar' },
          child1,
          Required(child2),
          RequireAll(child3, child4),
          RequireAny(child5, child6),
          child7
        );
      }
    );

    it(
      "should get a node's properties from the supplied arguments (without children)",
      () => {
        function fn() {
          let properties = utils.getNodeProperties(arguments);

          expect(properties).to.be.ok;
          expect(properties).to.eql({
            name: 'foo',
            options: {
              alias: 'bar',
            },
          });
        }

        fn('foo', { alias: 'bar' });
      }
    );

    it(
      'should should throw an error if children are provided, but not welcome',
      () => {
        let anError = /children/i;
        let child = Command('child');

        function fn() {
          utils.getNodeProperties(arguments);
        }

        expect(fn.bind(null, 'foo', { alias: 'bar' }, child)).to.throw(anError);
      }
    );

    it(
      'should should throw an error if more than one command is required',
      () => {
        let anError = /more\sthan\sone/i;
        let child1 = Command('child1');
        let child2 = Command('child2');

        function fn() {
          utils.getNodeProperties(arguments, true);
        }

        expect(
          fn.bind(
            null,
            'foo',
            { alias: 'bar' },
            Required(child1),
            Required(child2)
          )
        ).to.throw(anError);
        expect(
          fn.bind(null, 'foo', { alias: 'bar' }, RequireAll(child1, child2))
        ).to.throw(anError);
      }
    );
  });

  describe('find', () => {
    let arr = [1, 2, 3, 4, 5];

    it('should return null if no items match the predicate', () => {
      let result = utils.find(arr, function (value) {
        return value > 5;
      });

      expect(result).to.be.null;
    });

    it('should return the value if an item matches the predicate', () => {
      let result = utils.find(arr, function (value) {
        return value < 4 && value > 2;
      });

      expect(result).to.equal(3);
    });
  });

  describe('each', () => {
    let arr = [1, 2, 3, 4, 5];

    it(
      'should call the provided function for each item in an array',
      () => {
        let count = 0;

        utils.each(arr, function (value, index) {
          expect(index).to.equal(count);
          expect(value).to.equal(arr[index]);
          count += 1;
        });

        expect(count).to.equal(5);
      }
    );
  });

  describe('any', () => {
    let arr = [1, 2, 3, 4, 5];

    it('should return true if any items match the predicate', () => {
      expect(
        utils.any(arr, function (value) {
          return value === 3;
        })
      ).to.be.true;

      expect(
        utils.any(arr, function (value) {
          return value === 10;
        })
      ).to.be.false;
    });
  });

  describe('several', () => {
    let arr = [1, 2, 3, 4, 5];

    it('should return true if several items match the predicate', () => {
      expect(
        utils.several(arr, function (value) {
          return value > 3;
        })
      ).to.be.true;

      expect(
        utils.several(arr, function (value) {
          return value === 1;
        })
      ).to.be.false;
    });
  });

  describe('sum', () => {
    it('should sum the values in an array', () => {
      expect(utils.sum([1, 2, 3, 4])).to.equal(10);
      expect(utils.sum([1, 2, 3, 4, 5])).to.equal(15);
      expect(utils.sum([3, 4, 2])).to.equal(9);
    });
  });

  describe('sortByName', () => {
    it('should sort some nodes by name', () => {
      let nodes = [
        { name: 'c' },
        { name: 'a' },
        { name: 'b' },
        { name: 'd' },
        { name: 'a' },
        { name: 'e' },
      ];

      expect(nodes.sort(utils.sortByName)).to.eql([
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
      let schema = Command('test');
      let error = 'An error';

      let expected = ['', '  An error', '', ''].join('\n');

      expect(utils.createHelp(schema, {}, error)).to.equal(expected);
    });

    it('should create help with usage text', () => {
      let schema = Command('test', { usage: 'How to use' });
      let error = 'An error';

      let expected = ['', '  Usage: How to use', '', '  An error', '', ''].join(
        '\n'
      );

      expect(utils.createHelp(schema, {}, error)).to.equal(expected);
    });

    it('should create help with commands text', () => {
      let schema = Command(
        'test',
        null,
        Command('sub', { alias: 's', description: 'Description' })
      );
      let error = 'An error';

      let expected = [
        '',
        '  Commands:',
        '    sub, s  Description',
        '',
        '  An error',
        '',
        '',
      ].join('\n');

      let result = utils.createHelp(schema, {}, error);

      expect(result).to.equal(expected);
    });

    it('should create help with options text', () => {
      let schema = Command(
        'test',
        null,
        Arg('arg', { description: 'Desc 1' }),
        Flag('flag', { alias: 'f', description: 'Desc 2' })
      );
      let error = 'An error';

      let expected = [
        '',
        '  Options:',
        '    --flag, -f  Desc 2',
        '    <arg>       Desc 1',
        '',
        '  An error',
        '',
        '',
      ].join('\n');

      expect(utils.createHelp(schema, {}, error)).to.equal(expected);
    });

    it('should create help with global help option', () => {
      let schema = Help(
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
      let error = 'An error';

      let expected = [
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
        utils.createHelp(schema.children[0], schema._globals, error)
      ).to.equal(expected);
    });

    it('should create help with global help option (overridden)', () => {
      let schema = Help(
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
      let error = 'An error';

      let expected = [
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
        utils.createHelp(schema.children[0], schema._globals, error)
      ).to.equal(expected);
    });

    it('should create help with options text with types', () => {
      let schema = Command(
        'test',
        null,
        Arg('arg', { description: 'Desc 1', type: 'string' }),
        KWArg('kwarg', { alias: 'k', description: 'Desc 2', type: 'number' })
      );
      let error = 'An error';

      let expected = [
        '',
        '  Options:',
        '    --kwarg, -k  Desc 2                                                 [number]',
        '    <arg>        Desc 1                                                 [string]',
        '',
        '  An error',
        '',
        '',
      ].join('\n');

      expect(utils.createHelp(schema, {}, error)).to.equal(expected);
    });

    it('should create help with examples text', () => {
      let schema = Command('test', { examples: ['Just like this'] });
      let error = 'An error';

      let expected = [
        '',
        '  Examples:',
        '    Just like this',
        '',
        '  An error',
        '',
        '',
      ].join('\n');

      expect(utils.createHelp(schema, {}, error)).to.equal(expected);
    });

    it('should create some complex help text', () => {
      let schema = Command(
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
      let error = 'An error';

      let expected = [
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

      expect(utils.createHelp(schema, {}, error)).to.equal(expected);
    });
  });

  describe('formatTable', () => {
    it(
      'should format a table with 2 columns, and wrap the last column (commands)',
      () => {
        let table = [
          ['build', 'Build your project'],
          [
            'install, i',
            'Install new dependencies, or dependencies saved in your package.json',
          ],
        ];

        let expected = [
          '    build       Build your project',
          '    install, i  Install new dependencies, or dependencies saved in your',
          '                package.json',
        ].join('\n');

        let result = utils.formatTable(table, { alignRight: [], wrap: [1] });

        expect(result).to.equal(expected);
      }
    );

    it(
      'should format a table with 3 columns, and wrap the 2nd column (options)',
      () => {
        let table = [
          ['--help', 'Display help & usage information', ''],
          [
            '--transform, -t',
            'Plugin to use when compiling your javascript blah blah blah',
            '[string]',
          ],
          ['--version, -v', 'Display version number', ''],
        ];

        let expected = [
          '    --help           Display help & usage information',
          '    --transform, -t  Plugin to use when compiling your javascript blah  [string]',
          '                     blah blah',
          '    --version, -v    Display version number',
        ].join('\n');

        let result = utils.formatTable(table, { alignRight: [2], wrap: [1] });

        expect(result).to.equal(expected);
      }
    );

    it(
      'should format a table with 3 columns, and wrap the last 2, and right align the final column',
      () => {
        let table = [
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

        let expected = [
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

        let result = utils.formatTable(table, {
          alignRight: [2],
          wrap: [1, 2],
        });

        expect(result).to.equal(expected);
      }
    );

    it('should format a table with 3 columns and wrap them all', () => {
      let table = [
        [
          '40 character string la da da da da... da',
          'Another 40 character string la da da doo',
          'A super long 80 character string that will still be wrapped equal to the others!',
        ],
      ];

      // 80 - 4 - 2 - 2 = 72
      // 72 / 4 = 18
      // Column 1 & 2 get 18 chars, and column 3 gets 36

      let expected = [
        '    40 character        Another 40          A super long 80 character string',
        '    string la da da da  character string    that will still be wrapped equal to',
        '    da... da            la da da doo        the others!',
      ].join('\n');

      let result = utils.formatTable(table, {
        alignRight: [],
        wrap: [0, 1, 2],
      });

      expect(result).to.equal(expected);
    });
  });

  describe('formatRequiredList', () => {
    it('should format node names in a list', () => {
      expect(utils.formatRequiredList([Arg('arg'), KWArg('kwarg')])).to.equal(
        'arg, --kwarg'
      );
    });
  });
});
