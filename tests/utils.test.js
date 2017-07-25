/* global describe, it */

'use strict';

(function () {

  var expect = require('chai').expect;

  var Help = require('../src/help');
  var Program = require('../src/program');
  var Command = require('../src/command');
  var KWArg = require('../src/kwarg');
  var Flag = require('../src/flag');
  var Arg = require('../src/arg');
  var utils = require('../src/utils');
  var Required = require('../src/required');
  var RequireAll = require('../src/require-all');
  var RequireAny = require('../src/require-any');

  describe('utils.js', function () {

    it('should exist', function () {
      expect(utils).to.be.ok;
    });

    describe('argsToArray', function () {

      it('should convert arguments to an array', function () {
        function fn () {
          var args = utils.argsToArray(arguments);

          expect(Array.isArray(args)).to.be.true;
          expect(args).not.to.equal(arguments);
        }

        fn('foo', 'bar');
      });

    });

    describe('getNodeProperties', function () {

      it('should throw an error for invalid children', function () {
        var anError = /invalid/i;
        var child1 = Command('child1');
        var child2 = 'invalid';

        function fn () {
          utils.getNodeProperties(arguments, true);
        }

        expect(fn.bind(null, 'foo', {alias: 'bar'}, child1, child2)).to.throw(anError);
      });

      it('should throw an error for invalid types of children', function () {
        var anError = /invalid/i;
        var child1 = Command('child1');
        var child2 = Program('invalid');

        function fn () {
          utils.getNodeProperties(arguments, true);
        }

        expect(fn.bind(null, 'foo', {alias: 'bar'}, child1, child2)).to.throw(anError);
      });

      it('should get a node\'s properties from the supplied arguments (with children)', function () {
        var child1 = Command('child1');
        var child2 = Command('child2');
        var child3 = Command('child3');

        function fn () {
          var properties = utils.getNodeProperties(arguments, true);

          expect(properties).to.be.ok;
          expect(properties).to.eql({
            name: 'foo',
            options: {
              alias: 'bar'
            },
            children: [child1, child2, child3],
            _requireAll: [],
            _requireAny: []
          });
        }

        fn('foo', {alias: 'bar'}, child1, child2, child3);
      });

      it('should get a node\'s properties from the supplied arguments (with required children)', function () {
        var child1 = Arg('child1');
        var child2 = Arg('child2');
        var child3 = Arg('child3');
        var child4 = Arg('child4');
        var child5 = Arg('child5');
        var child6 = Arg('child6');
        var child7 = Arg('child7');

        function fn () {
          var properties = utils.getNodeProperties(arguments, true);

          expect(properties).to.be.ok;
          expect(properties).to.eql({
            name: 'foo',
            options: {
              alias: 'bar'
            },
            children: [child1, child2, child3, child4, child5, child6, child7],
            _requireAll: [child2, child3, child4],
            _requireAny: [[child5, child6]]
          });

          expect(properties.children[0]).to.equal(child1);
          expect(properties.children[3]).to.equal(child4);

          expect(properties._requireAll[1]).to.equal(child3);
          expect(properties._requireAny[0][0]).to.equal(child5);
        }

        fn(
          'foo',
          {alias: 'bar'},
          child1, Required(child2), RequireAll(child3, child4), RequireAny(child5, child6), child7
        );
      });

      it('should get a node\'s properties from the supplied arguments (without children)', function () {
        function fn () {
          var properties = utils.getNodeProperties(arguments);

          expect(properties).to.be.ok;
          expect(properties).to.eql({
            name: 'foo',
            options: {
              alias: 'bar'
            }
          });
        }

        fn('foo', {alias: 'bar'});
      });

      it('should should throw an error if children are provided, but not welcome', function () {
        var anError = /children/i;
        var child = Command('child');

        function fn () {
          utils.getNodeProperties(arguments);
        }

        expect(fn.bind(null, 'foo', {alias: 'bar'}, child)).to.throw(anError);
      });

      it('should should throw an error if more than one command is required', function () {
        var anError = /more\sthan\sone/i;
        var child1 = Command('child1');
        var child2 = Command('child2');

        function fn () {
          utils.getNodeProperties(arguments, true);
        }

        expect(fn.bind(null, 'foo', {alias: 'bar'}, Required(child1), Required(child2))).to.throw(anError);
        expect(fn.bind(null, 'foo', {alias: 'bar'}, RequireAll(child1, child2))).to.throw(anError);
      });

    });

    describe('find', function () {

      var arr = [1, 2, 3, 4, 5];

      it('should return null if no items match the predicate', function () {
        var result = utils.find(arr, function (value) {
          return value > 5;
        });

        expect(result).to.be.null;
      });

      it('should return the value if an item matches the predicate', function () {
        var result = utils.find(arr, function (value) {
          return value < 4 && value > 2;
        });

        expect(result).to.equal(3);
      });

    });

    describe('each', function () {

      var arr = [1, 2, 3, 4, 5];

      it('should call the provided function for each item in an array', function () {
        var count = 0;

        utils.each(arr, function (value, index) {
          expect(index).to.equal(count);
          expect(value).to.equal(arr[index]);
          count += 1;
        });

        expect(count).to.equal(5);
      });

    });

    describe('any', function () {

      var arr = [1, 2, 3, 4, 5];

      it('should return true if any items match the predicate', function () {
        expect(utils.any(arr, function (value) {
          return value === 3;
        })).to.be.true;

        expect(utils.any(arr, function (value) {
          return value === 10;
        })).to.be.false;
      });

    });

    describe('several', function () {

      var arr = [1, 2, 3, 4, 5];

      it('should return true if several items match the predicate', function () {
        expect(utils.several(arr, function (value) {
          return value > 3;
        })).to.be.true;

        expect(utils.several(arr, function (value) {
          return value === 1;
        })).to.be.false;
      });

    });

    describe('sum', function () {

      it('should sum the values in an array', function () {
        expect(utils.sum([1, 2, 3, 4])).to.equal(10);
        expect(utils.sum([1, 2, 3, 4, 5])).to.equal(15);
        expect(utils.sum([3, 4, 2])).to.equal(9);
      });

    });

    describe('sortByName', function () {

      it('should sort some nodes by name', function () {
        var nodes = [
          {name: 'c'},
          {name: 'a'},
          {name: 'b'},
          {name: 'd'},
          {name: 'a'},
          {name: 'e'}
        ];

        expect(nodes.sort(utils.sortByName)).to.eql([
          {name: 'a'},
          {name: 'a'},
          {name: 'b'},
          {name: 'c'},
          {name: 'd'},
          {name: 'e'}
        ]);
      });

    });

    describe('createHelp', function () {

      it('should create a basic error message', function () {
        var schema = Command('test');
        var error = 'An error';

        var expected = [
          '',
          '  An error',
          '',
          ''
        ].join('\n');

        expect(utils.createHelp(schema, {}, error)).to.equal(expected);
      });

      it('should create help with usage text', function () {
        var schema = Command('test', {usage: 'How to use'});
        var error = 'An error';

        var expected = [
          '',
          '  Usage: How to use',
          '',
          '  An error',
          '',
          ''
        ].join('\n');

        expect(utils.createHelp(schema, {}, error)).to.equal(expected);
      });

      it('should create help with commands text', function () {
        var schema = Command('test', null, Command('sub', {alias: 's', description: 'Description'}));
        var error = 'An error';

        var expected = [
          '',
          '  Commands:',
          '    sub, s  Description',
          '',
          '  An error',
          '',
          ''
        ].join('\n');

        var result = utils.createHelp(schema, {}, error);

        expect(result).to.equal(expected);
      });

      it('should create help with options text', function () {
        var schema = Command(
          'test',
          null,
          Arg(
            'arg',
            {description: 'Desc 1'}
          ),
          Flag(
            'flag',
            {alias: 'f', description: 'Desc 2'}
          )
        );
        var error = 'An error';

        var expected = [
          '',
          '  Options:',
          '    --flag, -f  Desc 2',
          '    <arg>       Desc 1',
          '',
          '  An error',
          '',
          ''
        ].join('\n');

        expect(utils.createHelp(schema, {}, error)).to.equal(expected);
      });

      it('should create help with global help option', function () {
        var schema = Help(
          'help',
          {
            alias: 'h',
            description: 'Display help and usage'
          },
          Program(
            'program',
            null,
            Command(
              'test',
              null,
              Arg(
                'arg',
                {description: 'Desc 1'}
              ),
              Flag(
                'flag',
                {alias: 'f', description: 'Desc 2'}
              )
            )
          )
        );
        var error = 'An error';

        var expected = [
          '',
          '  Options:',
          '    --flag, -f  Desc 2',
          '    --help, -h  Display help and usage',
          '    <arg>       Desc 1',
          '',
          '  An error',
          '',
          ''
        ].join('\n');

        expect(utils.createHelp(schema.children[0], schema._globals, error)).to.equal(expected);
      });

      it('should create help with global help option (overridden)', function () {
        var schema = Help(
          'help',
          {
            alias: 'h',
            description: 'Display help and usage'
          },
          Program(
            'program',
            null,
            Command(
              'test',
              null,
              Flag(
                'help',
                {
                  alias: 'h',
                  description: 'Display help and usage (overridden)'
                }
              ),
              Arg(
                'arg',
                {description: 'Desc 1'}
              ),
              Flag(
                'flag',
                {alias: 'f', description: 'Desc 2'}
              )
            )
          )
        );
        var error = 'An error';

        var expected = [
          '',
          '  Options:',
          '    --flag, -f  Desc 2',
          '    --help, -h  Display help and usage (overridden)',
          '    <arg>       Desc 1',
          '',
          '  An error',
          '',
          ''
        ].join('\n');

        expect(utils.createHelp(schema.children[0], schema._globals, error)).to.equal(expected);
      });

      it('should create help with options text with types', function () {
        var schema = Command(
          'test',
          null,
          Arg(
            'arg',
            {description: 'Desc 1', type: 'string'}
          ),
          KWArg(
            'kwarg',
            {alias: 'k', description: 'Desc 2', type: 'number'}
          )
        );
        var error = 'An error';

        var expected = [
          '',
          '  Options:',
          '    --kwarg, -k  Desc 2                                                 [number]',
          '    <arg>        Desc 1                                                 [string]',
          '',
          '  An error',
          '',
          ''
        ].join('\n');

        expect(utils.createHelp(schema, {}, error)).to.equal(expected);
      });

      it('should create help with examples text', function () {
        var schema = Command(
          'test',
          {examples: ['Just like this']}
        );
        var error = 'An error';

        var expected = [
          '',
          '  Examples:',
          '    Just like this',
          '',
          '  An error',
          '',
          ''
        ].join('\n');

        expect(utils.createHelp(schema, {}, error)).to.equal(expected);
      });

      it('should create some complex help text', function () {
        var schema = Command(
          'test',
          {alias: 't', description: 'A command', usage: 'Used like this', examples: ['Example 1', 'Example 2']},
          Arg(
            'arg',
            {description: 'Desc 1', type: 'string'}
          ),
          Flag(
            'flag',
            {alias: 'f', description: 'Desc 2'}
          ),
          KWArg(
            'kwarg',
            {alias: 'k', description: 'Desc 3', type: 'boolean'}
          ),
          Command(
            'sub',
            {description: 'A sub command'}
          )
        );
        var error = 'An error';

        var expected = [
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
          ''
        ].join('\n');

        expect(utils.createHelp(schema, {}, error)).to.equal(expected);
      });

    });

    describe('formatTable', function () {

      it('should format a table with 2 columns, and wrap the last column (commands)', function () {
        var table = [
          ['build', 'Build your project'],
          ['install, i', 'Install new dependencies, or dependencies saved in your package.json']
        ];

        var expected = [
          '    build       Build your project',
          '    install, i  Install new dependencies, or dependencies saved in your',
          '                package.json'
        ].join('\n');

        var result = utils.formatTable(table, {alignRight: [], wrap: [1]});

        expect(result).to.equal(expected);
      });

      it('should format a table with 3 columns, and wrap the 2nd column (options)', function () {
        var table = [
          ['--help', 'Display help & usage information', ''],
          ['--transform, -t', 'Plugin to use when compiling your javascript blah blah blah', '[string]'],
          ['--version, -v', 'Display version number', '']
        ];

        var expected = [
          '    --help           Display help & usage information',
          '    --transform, -t  Plugin to use when compiling your javascript blah  [string]',
          '                     blah blah',
          '    --version, -v    Display version number'
        ].join('\n');

        var result = utils.formatTable(table, {alignRight: [2], wrap: [1]});

        expect(result).to.equal(expected);
      });

      it('should format a table with 3 columns, and wrap the last 2, and right align the final column', function () {
        var table = [
          [
            'line1',
            'Some text that should be wrapped',
            'Some right aligned text that will be wrappped'
          ],
          [
            'line2, l2',
            'Some incidentally wrapped text',
            'Some right aligned text'
          ],
          [
            'line3, l3',
            'No wrap',
            'Right aligned'
          ],
          [
            'line4, l4',
            'Another line of text that should be wrapped',
            'Some more right aligned text that will be wrapped onto 3 different lines because it\'s really quite long'
          ],
          [
            'line5, l5',
            'Ahyphenatedwordwillbewrapped',
            'Anotherhyphenatedwordwillbewrappedbuthastobelongerbecausethiscolumniswider'
          ]
        ];

        var expected = [
          '    line1      Some text that               Some right aligned text that will be',
          '               should be wrapped                                        wrappped',
          '    line2, l2  Some incidentally                         Some right aligned text',
          '               wrapped text',
          '    line3, l3  No wrap                                             Right aligned',
          '    line4, l4  Another line of         Some more right aligned text that will be',
          '               text that should be   wrapped onto 3 different lines because it\'s',
          '               wrapped                                         really quite long',
          '    line5, l5  Ahyphenatedwordwil-  Anotherhyphenatedwordwillbewrappedbuthastob-',
          '               lbewrapped                        elongerbecausethiscolumniswider'
        ].join('\n');

        var result = utils.formatTable(table, {alignRight: [2], wrap: [1, 2]});

        expect(result).to.equal(expected);
      });

      it('should format a table with 3 columns and wrap them all', function () {
        var table = [
          [
            '40 character string la da da da da... da',
            'Another 40 character string la da da doo',
            'A super long 80 character string that will still be wrapped equal to the others!'
          ]
        ];

        // 80 - 4 - 2 - 2 = 72
        // 72 / 4 = 18
        // Column 1 & 2 get 18 chars, and column 3 gets 36

        var expected = [
          '    40 character        Another 40          A super long 80 character string',
          '    string la da da da  character string    that will still be wrapped equal to',
          '    da... da            la da da doo        the others!'
        ].join('\n');

        var result = utils.formatTable(table, {alignRight: [], wrap: [0, 1, 2]});

        expect(result).to.equal(expected);
      });

    });

    describe('formatRequiredList', function () {

      it('should format node names in a list', function () {
        expect(utils.formatRequiredList([Arg('arg'), KWArg('kwarg')])).to.equal('arg, --kwarg');
      });

    });

  });

})();
