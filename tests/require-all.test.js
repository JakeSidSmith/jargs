import { Arg } from '../src/arg';
import { RequireAll } from '../src/require-all';

describe('require-all.js', () => {
  it('should construct an RequireAll', () => {
    let child1 = Arg('foo');
    let child2 = Arg('bar');
    let node = RequireAll(child1, child2);

    expect(node).toBeTruthy();
    expect(node).toEqual({
      _type: 'require-all',
      children: [child1, child2],
    });

    expect(node.children[0]).toBe(child1);
    expect(node.children[1]).toBe(child2);
  });

  it('should throw an error if no children are supplied', () => {
    let anError = /child/i;

    expect(RequireAll).toThrow(anError);
  });

  it('should throw an error if less than 2 children are supplied', () => {
    let anError = /child/i;
    let child = Arg('foo');
    let boundRequired = RequireAll.bind(null, child);

    expect(boundRequired).toThrow(anError);
  });
});
