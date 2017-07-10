/* global describe, it */

'use strict';

(function () {

  var expect = require('chai').expect;

  var Program = require('../src/program');
  var Command = require('../src/command');

  describe('program.js', function () {

    it('should construct a Program', function () {
      var child1 = Command('child1');
      var child2 = Command('child2');
      var node = Program('foo', null, child1, child2);

      expect(node).to.be.ok;
      expect(node).to.eql({
        _global: {},
        _type: 'program',
        name: 'foo',
        options: {
          description: '',
          usage: '',
          examples: []
        },
        children: [child1, child2],
        _requireAll: [],
        _requireAny: []
      });
    });

  });

})();
