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
        expect(node.bind(null, undefined)).toThrow(anError);
        expect(node.bind(null, null)).toThrow(anError);
        expect(node.bind(null, {})).toThrow(anError);
        expect(node.bind(null, [])).toThrow(anError);
        expect(node.bind(null, 1)).toThrow(anError);
      });
    });

    it('should error if node names are empty', () => {
      let anError = /empty/i;

      utils.each(nodes, function (node) {
        expect(node.bind(null, '')).toThrow(anError);
      });
    });

    it('should error if node names contain anything but letters, numbers & hyphens', () => {
      let anError = /letters.+numbers.+hyphens/i;

      utils.each(nodes, function (node) {
        expect(node.bind(null, ' test')).toThrow(anError);
        expect(node.bind(null, 'test ')).toThrow(anError);
        expect(node.bind(null, ' te st ')).toThrow(anError);

        expect(node.bind(null, '_test')).toThrow(anError);
        expect(node.bind(null, 'test_')).toThrow(anError);
        expect(node.bind(null, '_te_st_')).toThrow(anError);

        expect(node.bind(null, '+test')).toThrow(anError);
        expect(node.bind(null, 'test=')).toThrow(anError);
        expect(node.bind(null, 'te:st')).toThrow(anError);
      });
    });

    it('should error if node names begin with -', () => {
      let anError = /begin\swith/i;

      utils.each(nodes, function (node) {
        expect(node.bind(null, '-test')).toThrow(anError);
        expect(node.bind(null, 'word-word')).not.toThrow(anError);
      });
    });
  });

  describe('serializeOptions', () => {
    let nodesWithAliases = [Command, KWArg, Flag];

    it('should should throw an error if options is not an object', () => {
      let anError = /object/i;

      expect(Arg.bind(null, 'foo', 'test')).toThrow(anError);
      expect(Arg.bind(null, 'foo', [])).toThrow(anError);
      expect(Arg.bind(null, 'foo', 7)).toThrow(anError);
      expect(Arg.bind(null, 'foo', undefined)).not.toThrow(anError);
    });

    it('should should throw an error if a node is passed as options', () => {
      let anError = /node/i;

      expect(Arg.bind(null, 'foo', Arg('test'))).toThrow(anError);
    });

    it('should error if node aliases are not strings', () => {
      let anError = /string/i;

      utils.each(nodesWithAliases, function (node) {
        expect(node.bind(null, 'name', { alias: undefined })).toThrow(anError);
        expect(node.bind(null, 'name', { alias: null })).toThrow(anError);
        expect(node.bind(null, 'name', { alias: {} })).toThrow(anError);
        expect(node.bind(null, 'name', { alias: [] })).toThrow(anError);
        expect(node.bind(null, 'name', { alias: 1 })).toThrow(anError);
      });
    });

    it('should error if node aliases are empty', () => {
      let anError = /empty/i;

      utils.each(nodesWithAliases, function (node) {
        expect(node.bind(null, 'name', { alias: '' })).toThrow(anError);
      });
    });

    it('should error if node aliases contain anything but letters, numbers, and hyphens', () => {
      let anError = /letters.+numbers.+hyphens/i;

      utils.each(nodesWithAliases, function (node) {
        expect(node.bind(null, ' test')).toThrow(anError);
        expect(node.bind(null, 'test ')).toThrow(anError);
        expect(node.bind(null, ' te st ')).toThrow(anError);

        expect(node.bind(null, '_test')).toThrow(anError);
        expect(node.bind(null, 'test_')).toThrow(anError);
        expect(node.bind(null, '_te_st_')).toThrow(anError);

        expect(node.bind(null, '+test')).toThrow(anError);
        expect(node.bind(null, 'test=')).toThrow(anError);
        expect(node.bind(null, 'te:st')).toThrow(anError);
      });
    });

    it('should error if node aliases begin with -', () => {
      let anError = /begin\swith/i;

      utils.each(nodesWithAliases, function (node) {
        expect(node.bind(null, 'name', { alias: '-test' })).toThrow(anError);
        expect(node.bind(null, 'name', { alias: 'word-word' })).not.toThrow(
          anError
        );
      });
    });

    it('should validate options', () => {
      let anError = /invalid/i;

      expect(
        utils.serializeOptions.bind(null, { foo: 'bar' }, { bar: 'foo' })
      ).toThrow(anError);
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
      ).toThrow(aStringError);
      expect(
        utils.serializeOptions.bind(null, { number: null }, validOptions)
      ).toThrow(aNumberError);
      expect(
        utils.serializeOptions.bind(null, { object: null }, validOptions)
      ).toThrow(anObjectError);
      expect(
        utils.serializeOptions.bind(null, { array: null }, validOptions)
      ).toThrow(anArrayError);
      expect(
        utils.serializeOptions.bind(null, { boolean: null }, validOptions)
      ).toThrow(aBooleanError);
      expect(
        utils.serializeOptions.bind(null, { func: null }, validOptions)
      ).toThrow(aFuncError);
    });
  });
});

describe('validateChildren', () => {
  it('should throw an error if children are not nodes', () => {
    let anError = /invalid/i;

    expect(utils.validateChildren.bind(null, [1])).toThrow(anError);
    expect(utils.validateChildren.bind(null, ['a'])).toThrow(anError);
    expect(utils.validateChildren.bind(null, [undefined])).toThrow(anError);
    expect(utils.validateChildren.bind(null, [{}])).not.toThrow(anError);
  });

  it('should throw an error if children are not the correct type', () => {
    let validTypes = ['arg', 'kwarg'];
    let anError = /invalid/i;

    expect(
      utils.validateChildren.bind(null, [{ _type: 'foo' }], validTypes)
    ).toThrow(anError);
    expect(
      utils.validateChildren.bind(
        null,
        [{ _type: 'arg' }, { _type: 'bar' }],
        validTypes
      )
    ).toThrow(anError);
    expect(
      utils.validateChildren.bind(
        null,
        [{ _type: 'arg' }, { _type: 'kwarg' }],
        validTypes
      )
    ).not.toThrow(anError);
  });

  it('should throw an error for duplicate node names', () => {
    let validTypes = ['command', 'arg', 'flag', 'kwarg'];
    let anError = /name\s"foo"/i;

    let goodChildren = [Arg('foo'), KWArg('foo'), Command('bar'), Flag('bar')];

    let badArgChildren = [Arg('foo'), Arg('foo')];

    let badKWArgChildren = [KWArg('foo'), Flag('foo')];

    let badOtherChildren = [Command('foo'), Command('foo')];

    expect(
      utils.validateChildren.bind(null, goodChildren, validTypes)
    ).not.toThrow();
    expect(
      utils.validateChildren.bind(null, badArgChildren, validTypes)
    ).toThrow(anError);
    expect(
      utils.validateChildren.bind(null, badKWArgChildren, validTypes)
    ).toThrow(anError);
    expect(
      utils.validateChildren.bind(null, badOtherChildren, validTypes)
    ).toThrow(anError);
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
    ).not.toThrow();
    expect(
      utils.validateChildren.bind(null, badKWArgChildren, validTypes)
    ).toThrow(anError);
    expect(
      utils.validateChildren.bind(null, badOtherChildren, validTypes)
    ).toThrow(anError);
  });
});
