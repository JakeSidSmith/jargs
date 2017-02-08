/* global describe, it */

'use strict';

(function () {

  var expect = require('chai').expect;

  var Command = require('../src/command');
  var KWArg = require('../src/kwarg');
  var Flag = require('../src/flag');
  var Arg = require('../src/arg');
  var utils = require('../src/utils');

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

      it('should get a node\'s properties from the supplied arguments (with children)', function () {
        function fn () {
          var properties = utils.getNodeProperties(arguments, true);

          expect(properties).to.be.ok;
          expect(properties.name).to.equal('foo');
          expect(properties.options).to.eql({alias: 'bar'});
          expect(properties.children).to.eql(['child1', 'child2', 'child3']);
        }

        fn('foo', {alias: 'bar'}, 'child1', 'child2', 'child3');
      });

      it('should get a node\'s properties from the supplied arguments (without children)', function () {
        function fn () {
          var properties = utils.getNodeProperties(arguments);

          expect(properties).to.be.ok;
          expect(properties.name).to.equal('foo');
          expect(properties.options).to.eql({alias: 'bar'});
          expect(properties.children).to.be.undefined;
        }

        fn('foo', {alias: 'bar'});
      });

      it('should should throw an error if children are provided, but not welcome', function () {
        var anError = /children/i;

        function fn () {
          var properties = utils.getNodeProperties(arguments);

          expect(properties).to.be.ok;
          expect(properties.name).to.equal('foo');
          expect(properties.options).to.eql({alias: 'bar'});
          expect(properties.children).to.be.undefined;
        }

        expect(fn.bind(null, 'foo', {alias: 'bar'}, 'child')).to.throw(anError);
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

        expect(utils.createHelp(schema, error)).to.equal(expected);
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

        expect(utils.createHelp(schema, error)).to.equal(expected);
      });

      it('should create help with commands text', function () {
        var schema = Command('test', null, Command('sub', {alias: 's', description: 'Description'}));
        var error = 'An error';

        var expected = [
          '',
          '  Commands:',
          '    sub, s   Description',
          '',
          '  An error',
          '',
          ''
        ].join('\n');

        expect(utils.createHelp(schema, error)).to.equal(expected);
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
          '    arg   Desc 1',
          '    --flag, -f   Desc 2',
          '',
          '  An error',
          '',
          ''
        ].join('\n');

        expect(utils.createHelp(schema, error)).to.equal(expected);
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
          '    arg   Desc 1   [string]',
          '    --kwarg, -k   Desc 2   [number]',
          '',
          '  An error',
          '',
          ''
        ].join('\n');

        expect(utils.createHelp(schema, error)).to.equal(expected);
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

        expect(utils.createHelp(schema, error)).to.equal(expected);
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
            {alias: 'k', description: 'Desc 3', type: 'number'}
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
          '    sub   A sub command',
          '',
          '  Options:',
          '    arg   Desc 1   [string]',
          '    --flag, -f   Desc 2',
          '    --kwarg, -k   Desc 3   [number]',
          '',
          '  Examples:',
          '    Example 1',
          '    Example 2',
          '',
          '  An error',
          '',
          ''
        ].join('\n');

        expect(utils.createHelp(schema, error)).to.equal(expected);
      });

    });

    describe('formatTable', function () {

      it('should format a table with 2 columns, and wrap the last column (commands)', function () {
        var table = [
          ['build', 'Build your project'],
          ['install, i', 'Install new dependencies, or dependencies saved in your package.json']
        ];

        var indent = '    ';
        var margin = '  ';
        var descriptionIndent = indent.length + table[1][0].length + margin.length;

        var result = utils.formatTable(table, {alignRight: [], wrap: [1]});
        var lines = result.split('\n');

        expect(lines.length).to.equal(3);

        expect(lines[0].indexOf('Build')).to.equal(descriptionIndent);
        expect(lines[0].substring(0, indent.length)).to.equal(indent);
        expect(lines[0].substring(descriptionIndent - margin.length, descriptionIndent)).to.equal(margin);

        expect(lines[1].indexOf('Install')).to.equal(descriptionIndent);
        expect(lines[1].substring(0, indent.length)).to.equal(indent);
        expect(lines[1].substring(descriptionIndent - margin.length, descriptionIndent)).to.equal(margin);

        expect(/\S/.exec(lines[2]).index).to.equal(descriptionIndent);
        expect(lines[2].substring(0, indent.length)).to.equal(indent);
        expect(lines[2].substring(descriptionIndent - margin.length, descriptionIndent)).to.equal(margin);
      });

      it('should format a table with 3 columns, and wrap the 2nd column (options)', function () {
        var table = [
          ['--help', 'Display help & usage information', ''],
          ['--transform, -t', 'Plugin to use when compiling your javascript blah blah blah', '[string]'],
          ['--version, -v', 'Display version number', '']
        ];

        var indent = '    ';
        var margin = '  ';
        var descriptionIndent = indent.length + table[1][0].length + margin.length;

        var result = utils.formatTable(table, {alignRight: [2], wrap: [1]});
        var lines = result.split('\n');

        expect(lines.length).to.equal(4);

        expect(lines[0].indexOf('Display')).to.equal(descriptionIndent);
        expect(lines[0].substring(0, indent.length)).to.equal(indent);
        expect(lines[0].substring(descriptionIndent - margin.length, descriptionIndent)).to.equal(margin);

        expect(lines[1].indexOf('Plugin')).to.equal(descriptionIndent);
        expect(lines[1].substring(0, indent.length)).to.equal(indent);
        expect(lines[1].substring(descriptionIndent - margin.length, descriptionIndent)).to.equal(margin);
        expect(lines[1].substring(lines[1].length - 8 - margin.length)).to.equal(margin + '[string]');

        expect(/\S/.exec(lines[2]).index).to.equal(descriptionIndent);
        expect(lines[2].substring(0, indent.length)).to.equal(indent);
        expect(lines[2].substring(descriptionIndent - margin.length, descriptionIndent)).to.equal(margin);

        expect(lines[3].indexOf('Display')).to.equal(descriptionIndent);
        expect(lines[3].substring(0, indent.length)).to.equal(indent);
        expect(lines[3].substring(descriptionIndent - margin.length, descriptionIndent)).to.equal(margin);
      });

    });

  });

})();
