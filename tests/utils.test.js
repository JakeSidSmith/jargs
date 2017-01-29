/* global describe, it */

'use strict';

(function () {

  var expect = require('chai').expect;

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

  });

})();
