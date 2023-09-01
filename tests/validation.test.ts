/* eslint-disable @typescript-eslint/no-explicit-any */
import { Arg } from '../src/arg';
import { Command } from '../src/command';
import { Flag } from '../src/flag';
import { KWArg } from '../src/kwarg';
import { NodeType } from '../src/types';
import { AnyOptions } from '../src/types-internal';
import * as utils from '../src/utils';

describe('validation', () => {
  describe('validateName', () => {
    const nodes = [Command, KWArg, Flag, Arg];

    it('should error if node names are not strings', () => {
      const anError = /string/i;

      nodes.forEach(function (node) {
        expect((node as any).bind(null, undefined)).toThrow(anError);
        expect((node as any).bind(null, null)).toThrow(anError);
        expect((node as any).bind(null, {})).toThrow(anError);
        expect((node as any).bind(null, [])).toThrow(anError);
        expect((node as any).bind(null, 1)).toThrow(anError);
      });
    });

    it('should error if node names are empty', () => {
      const anError = /empty/i;

      nodes.forEach(function (node) {
        expect((node as any).bind(null, '')).toThrow(anError);
      });
    });

    it('should error if node names contain anything but letters, numbers & hyphens', () => {
      const anError = /letters.+numbers.+hyphens/i;

      nodes.forEach(function (node) {
        expect((node as any).bind(null, ' test')).toThrow(anError);
        expect((node as any).bind(null, 'test ')).toThrow(anError);
        expect((node as any).bind(null, ' te st ')).toThrow(anError);

        expect((node as any).bind(null, '_test')).toThrow(anError);
        expect((node as any).bind(null, 'test_')).toThrow(anError);
        expect((node as any).bind(null, '_te_st_')).toThrow(anError);

        expect((node as any).bind(null, '+test')).toThrow(anError);
        expect((node as any).bind(null, 'test=')).toThrow(anError);
        expect((node as any).bind(null, 'te:st')).toThrow(anError);
      });
    });

    it('should error if node names begin with -', () => {
      const anError = /begin\swith/i;

      nodes.forEach(function (node) {
        expect((node as any).bind(null, '-test')).toThrow(anError);
        expect((node as any).bind(null, 'word-word')).not.toThrow(anError);
      });
    });
  });

  describe('serializeOptions', () => {
    const nodesWithAliases = [Command, KWArg, Flag];

    it('should should throw an error if options is not an object', () => {
      const anError = /object/i;

      expect((Arg as any).bind(null, 'foo', 'test')).toThrow(anError);
      expect((Arg as any).bind(null, 'foo', [])).toThrow(anError);
      expect((Arg as any).bind(null, 'foo', 7)).toThrow(anError);
      expect(Arg.bind(null, 'foo', undefined)).not.toThrow(anError);
    });

    it('should should throw an error if a node is passed as options', () => {
      const anError = /node/i;

      expect((Arg as any).bind(null, 'foo', Arg('test'))).toThrow(anError);
    });

    it('should error if node aliases are not strings', () => {
      const anError = /string/i;

      nodesWithAliases.forEach(function (node) {
        expect((node as any).bind(null, 'name', { alias: undefined })).toThrow(
          anError
        );
        expect((node as any).bind(null, 'name', { alias: null })).toThrow(
          anError
        );
        expect((node as any).bind(null, 'name', { alias: {} })).toThrow(
          anError
        );
        expect((node as any).bind(null, 'name', { alias: [] })).toThrow(
          anError
        );
        expect((node as any).bind(null, 'name', { alias: 1 })).toThrow(anError);
      });
    });

    it('should error if node aliases are empty', () => {
      const anError = /empty/i;

      nodesWithAliases.forEach(function (node) {
        expect((node as any).bind(null, 'name', { alias: '' })).toThrow(
          anError
        );
      });
    });

    it('should error if node aliases contain anything but letters, numbers, and hyphens', () => {
      const anError = /letters.+numbers.+hyphens/i;

      nodesWithAliases.forEach(function (node) {
        expect((node as any).bind(null, ' test')).toThrow(anError);
        expect((node as any).bind(null, 'test ')).toThrow(anError);
        expect((node as any).bind(null, ' te st ')).toThrow(anError);

        expect((node as any).bind(null, '_test')).toThrow(anError);
        expect((node as any).bind(null, 'test_')).toThrow(anError);
        expect((node as any).bind(null, '_te_st_')).toThrow(anError);

        expect((node as any).bind(null, '+test')).toThrow(anError);
        expect((node as any).bind(null, 'test=')).toThrow(anError);
        expect((node as any).bind(null, 'te:st')).toThrow(anError);
      });
    });

    it('should error if node aliases begin with -', () => {
      const anError = /begin\swith/i;

      nodesWithAliases.forEach(function (node) {
        expect((node as any).bind(null, 'name', { alias: '-test' })).toThrow(
          anError
        );
        expect(
          (node as any).bind(null, 'name', { alias: 'word-word' })
        ).not.toThrow(anError);
      });
    });

    it('should validate options', () => {
      const anError = /invalid/i;

      expect(
        utils.serializeOptions.bind(
          null,
          { foo: 'bar' } as AnyOptions,
          {
            bar: 'foo',
          } as any
        )
      ).toThrow(anError);
    });

    it('should validate option types', () => {
      const validOptions = {
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
      } as const;

      const aStringError = /type\sstring/i;
      const aNumberError = /type\snumber/i;
      const anObjectError = /type\sobject/i;
      const anArrayError = /type\sarray/i;
      const aBooleanError = /type\sboolean/i;
      const aFuncError = /type\sfunction/i;

      expect(
        utils.serializeOptions.bind(
          null,
          { string: null } as AnyOptions,
          validOptions
        )
      ).toThrow(aStringError);
      expect(
        utils.serializeOptions.bind(
          null,
          { number: null } as AnyOptions,
          validOptions
        )
      ).toThrow(aNumberError);
      expect(
        utils.serializeOptions.bind(
          null,
          { object: null } as AnyOptions,
          validOptions
        )
      ).toThrow(anObjectError);
      expect(
        utils.serializeOptions.bind(
          null,
          { array: null } as AnyOptions,
          validOptions
        )
      ).toThrow(anArrayError);
      expect(
        utils.serializeOptions.bind(
          null,
          { boolean: null } as AnyOptions,
          validOptions
        )
      ).toThrow(aBooleanError);
      expect(
        utils.serializeOptions.bind(
          null,
          { func: null } as AnyOptions,
          validOptions
        )
      ).toThrow(aFuncError);
    });
  });
});

describe('validateChildren', () => {
  it('should throw an error if children are not nodes', () => {
    const anError = /invalid/i;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((utils.validateChildren as any).bind(null, [1])).toThrow(anError);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((utils.validateChildren as any).bind(null, ['a'])).toThrow(anError);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((utils.validateChildren as any).bind(null, [undefined])).toThrow(
      anError
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((utils.validateChildren as any).bind(null, [{}])).not.toThrow(
      anError
    );
  });

  it('should throw an error if children are not the correct type', () => {
    const validTypes = [NodeType.ARG, NodeType.KW_ARG];
    const anError = /invalid/i;

    expect(
      utils.validateChildren.bind(
        null,
        [{ _type: 'foo' as NodeType.ARG, name: 'foo', options: {} }],
        validTypes
      )
    ).toThrow(anError);
    expect(
      utils.validateChildren.bind(
        null,
        [
          { _type: NodeType.ARG, name: 'foo', options: {} },
          { _type: 'bar' as NodeType.ARG, name: 'bar', options: {} },
        ],
        validTypes
      )
    ).toThrow(anError);
    expect(
      utils.validateChildren.bind(
        null,
        [
          { _type: NodeType.ARG, name: 'foo', options: {} },
          { _type: NodeType.KW_ARG, name: 'bar', options: {} },
        ],
        validTypes
      )
    ).not.toThrow(anError);
  });

  it('should throw an error for duplicate node names', () => {
    const validTypes = [
      NodeType.COMMAND,
      NodeType.ARG,
      NodeType.FLAG,
      NodeType.KW_ARG,
    ];
    const anError = /name\s"foo"/i;

    const goodChildren = [
      Arg('foo'),
      KWArg('foo'),
      Command('bar'),
      Flag('bar'),
    ];

    const badArgChildren = [Arg('foo'), Arg('foo')];

    const badKWArgChildren = [KWArg('foo'), Flag('foo')];

    const badOtherChildren = [Command('foo'), Command('foo')];

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
    const validTypes = [
      NodeType.COMMAND,
      NodeType.ARG,
      NodeType.FLAG,
      NodeType.KW_ARG,
    ];
    const anError = /alias\s"f"/i;

    const goodChildren = [
      Arg('foo'),
      KWArg('foo', { alias: 'f' }),
      Command('bar', { alias: 'b' }),
      Flag('bar', { alias: 'b' }),
    ];

    const badKWArgChildren = [
      KWArg('foo', { alias: 'f' }),
      Flag('bar', { alias: 'f' }),
    ];

    const badOtherChildren = [
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
