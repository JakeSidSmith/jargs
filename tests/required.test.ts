import { Arg } from '../src/arg';
import { Required } from '../src/required';

describe('required.js', () => {
  it('should construct an Required', () => {
    const child = Arg('foo');
    const node = Required(child);

    expect(node).toBeTruthy();
    expect(node).toEqual({
      _type: 'required',
      children: [child],
    });

    expect(node.children[0]).toBe(child);
  });

  it('should throw an error if no children are supplied', () => {
    const anError = /child/i;

    expect(Required).toThrow(anError);
  });

  it('should throw an error if more than one children are supplied', () => {
    const anError = /child/i;
    const child1 = Arg('foo');
    const child2 = Arg('bar');
    const boundRequired = Required.bind(null, child1, child2);

    expect(boundRequired).toThrow(anError);
  });
});
