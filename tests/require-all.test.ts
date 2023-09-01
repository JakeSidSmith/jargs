import { Arg } from '../src/arg';
import { RequireAll } from '../src/require-all';

describe('require-all.js', () => {
  it('should construct an RequireAll', () => {
    const child1 = Arg('foo');
    const child2 = Arg('bar');
    const node = RequireAll(child1, child2);

    expect(node).toBeTruthy();
    expect(node).toEqual({
      _type: 'require-all',
      children: [child1, child2],
    });

    expect(node.children[0]).toBe(child1);
    expect(node.children[1]).toBe(child2);
  });

  it('should throw an error if no children are supplied', () => {
    const anError = /child/i;

    expect(RequireAll).toThrow(anError);
  });

  it('should throw an error if less than 2 children are supplied', () => {
    const anError = /child/i;
    const child = Arg('foo');
    const boundRequired = RequireAll.bind(null, child);

    expect(boundRequired).toThrow(anError);
  });
});
