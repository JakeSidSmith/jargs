/* global describe, it */

'use strict';

(function () {

  var expect = require('chai').expect;

  var collect = require('../src/collect');
  var Command = require('../src/command');
  var KWArg = require('../src/kwarg');
  var Flag = require('../src/flag');
  var Arg = require('../src/arg');

  describe('collect.js', function () {

    it('should exist', function () {
      expect(collect).to.be.ok;
      expect(typeof collect).to.equal('function');
    });

    it('should return an arg tree when no args provided', function () {
      var boundCollect = collect.bind(null, 'node', 'npm', []);

      // Without tree
      var result = boundCollect(
        Command(
          'install'
        )
      );

      expect(result).to.eql({
        command: null,
        kwargs: {},
        flags: {},
        args: {}
      });

    });

    it('should return an arg tree when no schema provided', function () {
      var boundCollect = collect.bind(null, 'node', 'npm', ['install', 'jargs', '--save']);

      // Without tree
      var result = boundCollect();

      expect(result).to.eql({
        command: null,
        kwargs: {},
        flags: {},
        args: {}
      });

    });

    it('should return an arg tree for single command schema', function () {
      var boundCollect = collect.bind(null, 'node', 'npm', ['install', 'jargs', '--save']);

      // With single node
      var result = boundCollect(
        Command(
          'install'
        )
      );

      expect(result).to.eql({
        command: {
          name: 'install',
          command: null,
          kwargs: {},
          flags: {},
          args: {}
        },
        kwargs: {},
        flags: {},
        args: {}
      });

    });

    it('should return an arg tree with nested schema', function () {
      var boundCollect = collect.bind(null, 'node', 'npm', ['install', 'jargs', '--save']);

      // With nested nodes
      var result = boundCollect(
        Command(
          'install',
          null,
          Arg(
            'lib'
          )
        )
      );

      expect(result).to.eql({
        command: {
          name: 'install',
          command: null,
          kwargs: {},
          flags: {},
          args: {
            lib: {
              value: 'jargs',
              command: null,
              kwargs: {},
              flags: {},
              args: {}
            }
          }
        },
        kwargs: {},
        flags: {},
        args: {}
      });
    });

    it('should return an arg tree with nested schema and flags', function () {
      var boundCollect = collect.bind(null, 'node', 'npm', ['install', 'jargs', '--save']);

      // With nested nodes
      var result = boundCollect(
        Command(
          'install',
          null,
          Arg(
            'lib'
          ),
          Flag(
            'save'
          )
        )
      );

      expect(result).to.eql({
        command: {
          name: 'install',
          command: null,
          kwargs: {},
          flags: {
            save: {
              value: true,
              command: null,
              kwargs: {},
              flags: {},
              args: {}
            }
          },
          args: {
            lib: {
              value: 'jargs',
              command: null,
              kwargs: {},
              flags: {},
              args: {}
            }
          }
        },
        kwargs: {},
        flags: {},
        args: {}
      });
    });

    it('should return an arg tree with nested schema and kwargs', function () {
      var boundCollect = collect.bind(null, 'node', 'browserify', ['--transform', 'babelify', 'index.js']);

      // With nested nodes
      var result = boundCollect(
        Arg(
          'input'
        ),
        KWArg(
          'transform'
        )
      );

      expect(result).to.eql({
        command: null,
        kwargs: {
          transform: {
            value: 'babelify',
            command: null,
            kwargs: {},
            flags: {},
            args: {}
          }
        },
        flags: {},
        args: {
          input: {
            value: 'index.js',
            command: null,
            kwargs: {},
            flags: {},
            args: {}
          }
        }
      });
    });

  });

})();
