/* global describe, it */

'use strict';

(function () {

  var expect = require('chai').expect;

  var utils = require('../src/utils');
  var Command = require('../src/command');
  var KWArg = require('../src/kwarg');
  var Flag = require('../src/flag');
  var Arg = require('../src/arg');

  describe('validation', function () {

    describe('validateName', function () {

      var nodes = [Command, KWArg, Flag, Arg];

      it('should error if node names are not strings', function () {
        var anError = /string/i;

        utils.each(nodes, function (node) {
          expect(node.bind(null, undefined)).to.throw(anError);
          expect(node.bind(null, null)).to.throw(anError);
          expect(node.bind(null, {})).to.throw(anError);
          expect(node.bind(null, [])).to.throw(anError);
          expect(node.bind(null, 1)).to.throw(anError);
        });
      });

      it('should error if node names are empty', function () {
        var anError = /empty/i;

        utils.each(nodes, function (node) {
          expect(node.bind(null, '')).to.throw(anError);
        });
      });

      it('should error if node names contain anything but letters, numbers & hyphens', function () {
        var anError = /letters.+numbers.+hyphens/i;

        utils.each(nodes, function (node) {
          expect(node.bind(null, ' test')).to.throw(anError);
          expect(node.bind(null, 'test ')).to.throw(anError);
          expect(node.bind(null, ' te st ')).to.throw(anError);

          expect(node.bind(null, '_test')).to.throw(anError);
          expect(node.bind(null, 'test_')).to.throw(anError);
          expect(node.bind(null, '_te_st_')).to.throw(anError);

          expect(node.bind(null, '+test')).to.throw(anError);
          expect(node.bind(null, 'test=')).to.throw(anError);
          expect(node.bind(null, 'te:st')).to.throw(anError);
        });
      });

      it('should error if node names begin with -', function () {
        var anError = /begin\swith/i;

        utils.each(nodes, function (node) {
          expect(node.bind(null, '-test')).to.throw(anError);
          expect(node.bind(null, 'word-word')).not.to.throw(anError);
        });
      });

    });

    describe('serializeOptions', function () {

      var nodesWithAliases = [Command, KWArg, Flag];

      it('should should throw an error if options is not an object', function () {
        var anError = /object/i;

        expect(Arg.bind(null, 'foo', 'test')).to.throw(anError);
        expect(Arg.bind(null, 'foo', [])).to.throw(anError);
        expect(Arg.bind(null, 'foo', 7)).to.throw(anError);
        expect(Arg.bind(null, 'foo', undefined)).not.to.throw(anError);
      });

      it('should should throw an error if a node is passed as options', function () {
        var anError = /node/i;

        expect(Arg.bind(null, 'foo', Arg('test'))).to.throw(anError);
      });

      it('should error if node aliases are not strings', function () {
        var anError = /string/i;

        utils.each(nodesWithAliases, function (node) {
          expect(node.bind(null, 'name', {alias: undefined})).to.throw(anError);
          expect(node.bind(null, 'name', {alias: null})).to.throw(anError);
          expect(node.bind(null, 'name', {alias: {}})).to.throw(anError);
          expect(node.bind(null, 'name', {alias: []})).to.throw(anError);
          expect(node.bind(null, 'name', {alias: 1})).to.throw(anError);
        });
      });

      it('should error if node aliases are empty', function () {
        var anError = /empty/i;

        utils.each(nodesWithAliases, function (node) {
          expect(node.bind(null, 'name', {alias: ''})).to.throw(anError);
        });
      });

      it('should error if node aliases contain anything but letters, numbers, and hyphens', function () {
        var anError = /letters.+numbers.+hyphens/i;

        utils.each(nodesWithAliases, function (node) {
          expect(node.bind(null, ' test')).to.throw(anError);
          expect(node.bind(null, 'test ')).to.throw(anError);
          expect(node.bind(null, ' te st ')).to.throw(anError);

          expect(node.bind(null, '_test')).to.throw(anError);
          expect(node.bind(null, 'test_')).to.throw(anError);
          expect(node.bind(null, '_te_st_')).to.throw(anError);

          expect(node.bind(null, '+test')).to.throw(anError);
          expect(node.bind(null, 'test=')).to.throw(anError);
          expect(node.bind(null, 'te:st')).to.throw(anError);
        });
      });

      it('should error if node aliases begin with -', function () {
        var anError = /begin\swith/i;

        utils.each(nodesWithAliases, function (node) {
          expect(node.bind(null, 'name', {alias: '-test'})).to.throw(anError);
          expect(node.bind(null, 'name', {alias: 'word-word'})).not.to.throw(anError);
        });
      });

      it('should validate options', function () {
        var anError = /invalid/i;

        expect(utils.serializeOptions.bind(null, {foo: 'bar'}, {bar: 'foo'})).to.throw(anError);
      });

      it('should validate option types', function () {
        var validOptions = {
          string: {
            type: 'string'
          },
          number: {
            type: 'number'
          },
          object: {
            type: 'object'
          },
          array: {
            type: 'array'
          },
          boolean: {
            type: 'boolean'
          },
          func: {
            type: 'function'
          }
        };

        var aStringError = /type\sstring/i;
        var aNumberError = /type\snumber/i;
        var anObjectError = /type\sobject/i;
        var anArrayError = /type\sarray/i;
        var aBooleanError = /type\sboolean/i;
        var aFuncError = /type\sfunction/i;

        expect(utils.serializeOptions.bind(null, {string: null}, validOptions)).to.throw(aStringError);
        expect(utils.serializeOptions.bind(null, {number: null}, validOptions)).to.throw(aNumberError);
        expect(utils.serializeOptions.bind(null, {object: null}, validOptions)).to.throw(anObjectError);
        expect(utils.serializeOptions.bind(null, {array: null}, validOptions)).to.throw(anArrayError);
        expect(utils.serializeOptions.bind(null, {boolean: null}, validOptions)).to.throw(aBooleanError);
        expect(utils.serializeOptions.bind(null, {func: null}, validOptions)).to.throw(aFuncError);
      });

    });

  });

  describe('validateChildren', function () {

    it('should throw an error if children are not nodes', function () {
      var anError = /invalid/i;

      expect(utils.validateChildren.bind(null, [1])).to.throw(anError);
      expect(utils.validateChildren.bind(null, ['a'])).to.throw(anError);
      expect(utils.validateChildren.bind(null, [undefined])).to.throw(anError);
      expect(utils.validateChildren.bind(null, [{}])).not.to.throw(anError);
    });

    it('should throw an error if children are not the correct type', function () {
      var validTypes = ['arg', 'kwarg'];
      var anError = /invalid/i;

      expect(utils.validateChildren.bind(null, [{_type: 'foo'}], validTypes)).to.throw(anError);
      expect(utils.validateChildren.bind(null, [{_type: 'arg'}, {_type: 'bar'}], validTypes)).to.throw(anError);
      expect(utils.validateChildren.bind(null, [{_type: 'arg'}, {_type: 'kwarg'}], validTypes)).not.to.throw(anError);
    });

    it('should throw an error for duplicate node names', function () {
      var validTypes = ['command', 'arg', 'flag', 'kwarg'];
      var anError = /name\s"foo"/i;

      var goodChildren = [
        Arg('foo'),
        KWArg('foo'),
        Command('bar'),
        Flag('bar')
      ];

      var badArgChildren = [
        Arg('foo'),
        Arg('foo')
      ];

      var badKWArgChildren = [
        KWArg('foo'),
        Flag('foo')
      ];

      var badOtherChildren = [
        Command('foo'),
        Command('foo')
      ];

      expect(utils.validateChildren.bind(null, goodChildren, validTypes)).not.to.throw();
      expect(utils.validateChildren.bind(null, badArgChildren, validTypes)).to.throw(anError);
      expect(utils.validateChildren.bind(null, badKWArgChildren, validTypes)).to.throw(anError);
      expect(utils.validateChildren.bind(null, badOtherChildren, validTypes)).to.throw(anError);
    });

    it('should throw an error for duplicate node aliases', function () {
      var validTypes = ['command', 'arg', 'flag', 'kwarg'];
      var anError = /alias\s"f"/i;

      var goodChildren = [
        Arg('foo'),
        KWArg('foo', {alias: 'f'}),
        Command('bar', {alias: 'b'}),
        Flag('bar', {alias: 'b'})
      ];

      var badKWArgChildren = [
        KWArg('foo', {alias: 'f'}),
        Flag('bar', {alias: 'f'})
      ];

      var badOtherChildren = [
        Command('foo', {alias: 'f'}),
        Command('bar', {alias: 'f'})
      ];

      expect(utils.validateChildren.bind(null, goodChildren, validTypes)).not.to.throw();
      expect(utils.validateChildren.bind(null, badKWArgChildren, validTypes)).to.throw(anError);
      expect(utils.validateChildren.bind(null, badOtherChildren, validTypes)).to.throw(anError);
    });

  });

})();
