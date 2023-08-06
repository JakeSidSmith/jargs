/* global describe, it */

import { expect } from 'chai';

import { Arg } from '../src/arg';
import { Command } from '../src/command';
import { Flag } from '../src/flag';
import { KWArg } from '../src/kwarg';
import * as utils from '../src/utils';

describe('validation', () => {
  describe('validateName', () => {
    let nodes = [Command, KWArg, Flag, Arg];

    it('should error if node names are not strings', () => {
      let anError = /string/i;

      utils.each(nodes, function (node) {
        expect(node.bind(null, undefined)).to.throw(anError);
        expect(node.bind(null, null)).to.throw(anError);
        expect(node.bind(null, {})).to.throw(anError);
        expect(node.bind(null, [])).to.throw(anError);
        expect(node.bind(null, 1)).to.throw(anError);
      });
    });

    it('should error if node names are empty', () => {
      let anError = /empty/i;

      utils.each(nodes, function (node) {
        expect(node.bind(null, '')).to.throw(anError);
      });
    });

    it(
      'should error if node names contain anything but letters, numbers & hyphens',
      () => {
        let anError = /letters.+numbers.+hyphens/i;

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
      }
    );

    it('should error if node names begin with -', () => {
      let anError = /begin\swith/i;

      utils.each(nodes, function (node) {
        expect(node.bind(null, '-test')).to.throw(anError);
        expect(node.bind(null, 'word-word')).not.to.throw(anError);
      });
    });
  });

  describe('serializeOptions', () => {
    let nodesWithAliases = [Command, KWArg, Flag];

    it('should should throw an error if options is not an object', () => {
      let anError = /object/i;

      expect(Arg.bind(null, 'foo', 'test')).to.throw(anError);
      expect(Arg.bind(null, 'foo', [])).to.throw(anError);
      expect(Arg.bind(null, 'foo', 7)).to.throw(anError);
      expect(Arg.bind(null, 'foo', undefined)).not.to.throw(anError);
    });

    it(
      'should should throw an error if a node is passed as options',
      () => {
        let anError = /node/i;

        expect(Arg.bind(null, 'foo', Arg('test'))).to.throw(anError);
      }
    );

    it('should error if node aliases are not strings', () => {
      let anError = /string/i;

      utils.each(nodesWithAliases, function (node) {
        expect(node.bind(null, 'name', { alias: undefined })).to.throw(anError);
        expect(node.bind(null, 'name', { alias: null })).to.throw(anError);
        expect(node.bind(null, 'name', { alias: {} })).to.throw(anError);
        expect(node.bind(null, 'name', { alias: [] })).to.throw(anError);
        expect(node.bind(null, 'name', { alias: 1 })).to.throw(anError);
      });
    });

    it('should error if node aliases are empty', () => {
      let anError = /empty/i;

      utils.each(nodesWithAliases, function (node) {
        expect(node.bind(null, 'name', { alias: '' })).to.throw(anError);
      });
    });

    it(
      'should error if node aliases contain anything but letters, numbers, and hyphens',
      () => {
        let anError = /letters.+numbers.+hyphens/i;

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
      }
    );

    it('should error if node aliases begin with -', () => {
      let anError = /begin\swith/i;

      utils.each(nodesWithAliases, function (node) {
        expect(node.bind(null, 'name', { alias: '-test' })).to.throw(anError);
        expect(node.bind(null, 'name', { alias: 'word-word' })).not.to.throw(
          anError
        );
      });
    });

    it('should validate options', () => {
      let anError = /invalid/i;

      expect(
        utils.serializeOptions.bind(null, { foo: 'bar' }, { bar: 'foo' })
      ).to.throw(anError);
    });

    it('should validate option types', () => {
      let validOptions = {
        string: {
          type: 'string',
        },
        number: {
          type: 'number',
        },
        object: {
          type: 'object',
        },
        array: {
          type: 'array',
        },
        boolean: {
          type: 'boolean',
        },
        func: {
          type: 'function',
        },
      };

      let aStringError = /type\sstring/i;
      let aNumberError = /type\snumber/i;
      let anObjectError = /type\sobject/i;
      let anArrayError = /type\sarray/i;
      let aBooleanError = /type\sboolean/i;
      let aFuncError = /type\sfunction/i;

      expect(
        utils.serializeOptions.bind(null, { string: null }, validOptions)
      ).to.throw(aStringError);
      expect(
        utils.serializeOptions.bind(null, { number: null }, validOptions)
      ).to.throw(aNumberError);
      expect(
        utils.serializeOptions.bind(null, { object: null }, validOptions)
      ).to.throw(anObjectError);
      expect(
        utils.serializeOptions.bind(null, { array: null }, validOptions)
      ).to.throw(anArrayError);
      expect(
        utils.serializeOptions.bind(null, { boolean: null }, validOptions)
      ).to.throw(aBooleanError);
      expect(
        utils.serializeOptions.bind(null, { func: null }, validOptions)
      ).to.throw(aFuncError);
    });
  });
});

describe('validateChildren', () => {
  it('should throw an error if children are not nodes', () => {
    let anError = /invalid/i;

    expect(utils.validateChildren.bind(null, [1])).to.throw(anError);
    expect(utils.validateChildren.bind(null, ['a'])).to.throw(anError);
    expect(utils.validateChildren.bind(null, [undefined])).to.throw(anError);
    expect(utils.validateChildren.bind(null, [{}])).not.to.throw(anError);
  });

  it(
    'should throw an error if children are not the correct type',
    () => {
      let validTypes = ['arg', 'kwarg'];
      let anError = /invalid/i;

      expect(
        utils.validateChildren.bind(null, [{ _type: 'foo' }], validTypes)
      ).to.throw(anError);
      expect(
        utils.validateChildren.bind(
          null,
          [{ _type: 'arg' }, { _type: 'bar' }],
          validTypes
        )
      ).to.throw(anError);
      expect(
        utils.validateChildren.bind(
          null,
          [{ _type: 'arg' }, { _type: 'kwarg' }],
          validTypes
        )
      ).not.to.throw(anError);
    }
  );

  it('should throw an error for duplicate node names', () => {
    let validTypes = ['command', 'arg', 'flag', 'kwarg'];
    let anError = /name\s"foo"/i;

    let goodChildren = [Arg('foo'), KWArg('foo'), Command('bar'), Flag('bar')];

    let badArgChildren = [Arg('foo'), Arg('foo')];

    let badKWArgChildren = [KWArg('foo'), Flag('foo')];

    let badOtherChildren = [Command('foo'), Command('foo')];

    expect(
      utils.validateChildren.bind(null, goodChildren, validTypes)
    ).not.to.throw();
    expect(
      utils.validateChildren.bind(null, badArgChildren, validTypes)
    ).to.throw(anError);
    expect(
      utils.validateChildren.bind(null, badKWArgChildren, validTypes)
    ).to.throw(anError);
    expect(
      utils.validateChildren.bind(null, badOtherChildren, validTypes)
    ).to.throw(anError);
  });

  it('should throw an error for duplicate node aliases', () => {
    let validTypes = ['command', 'arg', 'flag', 'kwarg'];
    let anError = /alias\s"f"/i;

    let goodChildren = [
      Arg('foo'),
      KWArg('foo', { alias: 'f' }),
      Command('bar', { alias: 'b' }),
      Flag('bar', { alias: 'b' }),
    ];

    let badKWArgChildren = [
      KWArg('foo', { alias: 'f' }),
      Flag('bar', { alias: 'f' }),
    ];

    let badOtherChildren = [
      Command('foo', { alias: 'f' }),
      Command('bar', { alias: 'f' }),
    ];

    expect(
      utils.validateChildren.bind(null, goodChildren, validTypes)
    ).not.to.throw();
    expect(
      utils.validateChildren.bind(null, badKWArgChildren, validTypes)
    ).to.throw(anError);
    expect(
      utils.validateChildren.bind(null, badOtherChildren, validTypes)
    ).to.throw(anError);
  });
});
