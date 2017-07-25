/* global describe, it */

'use strict';

(function () {

  var expect = require('chai').expect;

  var Program = require('../src/program');
  var Arg = require('../src/arg');
  var Help = require('../src/help');

  describe('help.js', function () {

    it('should construct a Help', function () {
      var node = Help('help', {alias: 'h'}, Program('foo'));

      expect(node).to.be.ok;
      expect(node).to.eql({
        _globals: {
          help: {
            _type: 'flag',
            name: 'help',
            options: {
              alias: 'h',
              description: ''
            }
          }
        },
        _type: 'program',
        _requireAll: [],
        _requireAny: [],
        name: 'foo',
        options: {
          description: '',
          usage: '',
          examples: []
        },
        children: []
      });
    });

    it('should throw an error if alias is more than 1 char', function () {
      var anError = /length/;
      var node = Help.bind(null, 'foo', {alias: 'fo'});

      expect(node).to.throw(anError);
    });

    it('should throw an error if no children are supplied', function () {
      var anError = /child/i;

      expect(Help).to.throw(anError);
    });

    it('should throw an error if more than one children are supplied', function () {
      var anError = /child/i;
      var child1 = Arg('foo');
      var child2 = Arg('bar');
      var boundRequired = Help.bind(null, 'help', null, child1, child2);

      expect(boundRequired).to.throw(anError);
    });

    it('should throw an error if child is not a Program', function () {
      var anError = /be\sprogram/i;
      var child = Arg('foo');
      var boundRequired = Help.bind(null, 'help', null, child);

      expect(boundRequired).to.throw(anError);
    });

  });

})();
