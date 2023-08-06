import { Flag } from '../src/flag';

describe('flag.js', () => {
  it('should construct a Flag', () => {
    let node = Flag('foo', { alias: 'f' });

    expect(node).toBeTruthy();
    expect(node.name).toBe('foo');
    expect(node.options).toEqual({ alias: 'f', description: '' });
    expect(node.children).toBeUndefined();
    expect(node._type).toBe('flag');
  });

  it('should throw an error if alias is more than 1 char', () => {
    let anError = /length/;
    let node = Flag.bind(null, 'foo', { alias: 'fo' });

    expect(node).toThrow(anError);
  });

  it('should throw an error if has children', () => {
    let anError = /children/i;

    expect(Flag.bind(null, 'foo', null, 'child')).toThrow(anError);
  });
});
