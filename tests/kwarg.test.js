/* global describe, it */

import { KWArg } from '../src/kwarg';

describe('kwarg.js', () => {
  it('should construct a KWArg', () => {
    let node = KWArg('foo', { alias: 'f' });

    expect(node).toBeTruthy();
    expect(node.name).toBe('foo');
    expect(node.options).toEqual({
      alias: 'f',
      description: '',
      multi: false,
    });
    expect(node.children).toBeUndefined();
    expect(node._type).toBe('kwarg');
  });

  it('should throw an error if alias is more than 1 char', () => {
    let anError = /length/;
    let node = KWArg.bind(null, 'foo', { alias: 'fo' });

    expect(node).toThrow(anError);
  });

  it('should throw an error if has children', () => {
    let anError = /children/i;

    expect(KWArg.bind(null, 'foo', null, 'child')).toThrow(anError);
  });
});
