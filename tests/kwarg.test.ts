import { KWArg } from '../src/kwarg';

describe('kwarg.js', () => {
  it('should construct a KWArg', () => {
    const node = KWArg('foo', { alias: 'f' });

    expect(node).toBeTruthy();
    expect(node.name).toBe('foo');
    expect(node.options).toEqual({
      alias: 'f',
      description: '',
      multi: false,
    });
    expect('children' in node).toBe(false);
    expect(node._type).toBe('kwarg');
  });

  it('should throw an error if alias is more than 1 char', () => {
    const anError = /length/;
    const node = KWArg.bind(null, 'foo', { alias: 'fo' });

    expect(node).toThrow(anError);
  });

  it('should throw an error if has children', () => {
    const anError = /children/i;

    expect(KWArg.bind(null, 'foo', null, 'child')).toThrow(anError);
  });
});
