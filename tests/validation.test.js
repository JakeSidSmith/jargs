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
