import { Arg } from '../src/arg';
import { RequireAny } from '../src/require-any';

describe('require-any.js', () => {
  it('should construct an RequireAll', () => {
    const child1 = Arg('foo');
    const child2 = Arg('bar');
    const node = RequireAny(child1, child2);

    expect(node).toBeTruthy();
    expect(node).toEqual({
      _type: 'require-any',
      children: [child1, child2],
    });

    expect(node.children[0]).toBe(child1);
    expect(node.children[1]).toBe(child2);
  });

  it('should throw an error if no children are supplied', () => {
    const anError = /child/i;

    expect(RequireAny).toThrow(anError);
  });

  it('should throw an error if less than 2 children are supplied', () => {
    const anError = /child/i;
    const child = Arg('foo');
    const boundRequired = RequireAny.bind(null, child);

    expect(boundRequired).toThrow(anError);
  });
});
