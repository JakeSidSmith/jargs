import { Flag } from '../src/flag';

describe('flag.js', () => {
  it('should construct a Flag', () => {
    const node = Flag('foo', { alias: 'f' });

    expect(node).toBeTruthy();
    expect(node.name).toBe('foo');
    expect(node.options).toEqual({ alias: 'f', description: '' });
    expect('children' in node).toBe(false);
    expect(node._type).toBe('flag');
  });

  it('should throw an error if alias is more than 1 char', () => {
    const anError = /length/;
    const node = Flag.bind(null, 'foo', { alias: 'fo' });

    expect(node).toThrow(anError);
  });

  it('should throw an error if has children', () => {
    const anError = /children/i;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((Flag as any).bind(null, 'foo', null, 'child')).toThrow(anError);
  });
});
