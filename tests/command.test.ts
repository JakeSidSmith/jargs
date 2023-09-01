import { Command } from '../src/command';

describe('command.js', () => {
  it('should construct a Command', () => {
    let child1 = Command('child1');
    let child2 = Command('child2');
    let node = Command('foo', { alias: 'bar' }, child1, child2);

    expect(node).toBeTruthy();
    expect(node.name).toBe('foo');
    expect(node.options).toEqual({
      alias: 'bar',
      description: '',
      usage: '',
      examples: [],
    });
    expect(node.children).toEqual([child1, child2]);
    expect(node._type).toBe('command');
  });
});
