/* global describe, it */

'use strict';

(function () {

  var expect = require('chai').expect;

  var index = require('../src/index');

  describe('index.js', function () {

    it('should export some stuff', function () {
      var keyTypeMap = {
        collect: 'function',
        Help: 'function',
        Program: 'function',
        Command: 'function',
        KWArg: 'function',
        Flag: 'function',
        Arg: 'function',
        Required: 'function',
        RequireAll: 'function',
        RequireAny: 'function'
      };

      expect(index).to.be.ok;

      for (var key in index) {
        expect(key in keyTypeMap).to.be.true;
        expect(typeof index[key]).to.equal(keyTypeMap[key]);
      }
    });

  });

})();
