/* global describe, it */

'use strict';

(function () {

  var expect = require('chai').expect;

  var utils = require('../src/utils');
  var Command = require('../src/command');
  var KWArg = require('../src/kwarg');
  var Flag = require('../src/flag');
  var Arg = require('../src/arg');

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

      it('should get a node\'s properties from the supplied arguments', function () {
        function fn () {
          var properties = utils.getNodeProperties(arguments);

          expect(properties).to.be.ok;
          expect(properties.name).to.equal('foo');
          expect(properties.options).to.eql({alias: 'bar'});
          expect(properties.children).to.eql(['child1', 'child2', 'child3']);
        }

        fn('foo', {alias: 'bar'}, 'child1', 'child2', 'child3');
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

    describe('validateName', function () {

      var nodes = [Command, KWArg, Flag, Arg];

      it('should error if node names are not strings', function () {
        var anError = /string/i;

        utils.each(nodes, function (node) {
          expect(node.bind(null, undefined)).to.throw(anError);
          expect(node.bind(null, null)).to.throw(anError);
          expect(node.bind(null, {})).to.throw(anError);
          expect(node.bind(null, [])).to.throw(anError);
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

  });

})();
