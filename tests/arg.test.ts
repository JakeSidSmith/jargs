import { Arg } from '../src/arg';

describe('arg.js', () => {
  it('should construct an Arg', () => {
    const node = Arg('foo', null);

    expect(node).toBeTruthy();
    expect(node.name).toBe('foo');
    expect(node.options).toEqual({ description: '', multi: false });
    expect('children' in node).toBe(false);
    expect(node._type).toBe('arg');
  });

  it('should throw an error if has children', () => {
    const anError = /children/i;

    expect(Arg.bind(null, 'foo', null, 'child')).toThrow(anError);
  });
});
