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

      it('should error if node names contain spaces', function () {
        var anError = /spaces/i;

        utils.each(nodes, function (node) {
          expect(node.bind(null, ' test')).to.throw(anError);
          expect(node.bind(null, 'test ')).to.throw(anError);
          expect(node.bind(null, ' te st ')).to.throw(anError);
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

      it('should error if node names contain spaces', function () {
        var anError = /spaces/i;

        utils.each(nodesWithAliases, function (node) {
          expect(node.bind(null, 'name', {alias: ' test'})).to.throw(anError);
          expect(node.bind(null, 'name', {alias: 'test '})).to.throw(anError);
          expect(node.bind(null, 'name', {alias: ' te st '})).to.throw(anError);
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
          }
        };

        var aStringError = /type\sstring/i;
        var aNumberError = /type\snumber/i;
        var anObjectError = /type\sobject/i;
        var anArrayError = /type\sarray/i;
        var aBooleanError = /type\sboolean/i;

        expect(utils.serializeOptions.bind(null, {string: null}, validOptions)).to.throw(aStringError);
        expect(utils.serializeOptions.bind(null, {number: null}, validOptions)).to.throw(aNumberError);
        expect(utils.serializeOptions.bind(null, {object: null}, validOptions)).to.throw(anObjectError);
        expect(utils.serializeOptions.bind(null, {array: null}, validOptions)).to.throw(anArrayError);
        expect(utils.serializeOptions.bind(null, {boolean: null}, validOptions)).to.throw(aBooleanError);
      });

    });

  });

})();
