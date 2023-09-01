import { Arg } from '../src/arg';
import { Help } from '../src/help';
import { Program } from '../src/program';

describe('help.js', () => {
  it('should construct a Help', () => {
    const node = Help('help', { alias: 'h' }, Program('foo'));

    expect(node).toBeTruthy();
    expect(node).toEqual({
      _globals: {
        help: {
          _type: 'flag',
          name: 'help',
          options: {
            alias: 'h',
            description: '',
          },
        },
      },
      _type: 'program',
      _requireAll: [],
      _requireAny: [],
      name: 'foo',
      options: {
        description: '',
        usage: '',
        examples: [],
      },
      children: [],
    });
  });

  it('should throw an error if alias is more than 1 char', () => {
    const anError = /length/;
    const node = Help.bind(null, 'foo', { alias: 'fo' });

    expect(node).toThrow(anError);
  });

  it('should throw an error if no children are supplied', () => {
    const anError = /child/i;

    expect(Help).toThrow(anError);
  });

  it('should throw an error if more than one children are supplied', () => {
    const anError = /child/i;
    const child1 = Arg('foo');
    const child2 = Arg('bar');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const boundRequired = (Help as any).bind(
      null,
      'help',
      null,
      child1,
      child2
    );

    expect(boundRequired).toThrow(anError);
  });

  it('should throw an error if child is not a Program', () => {
    const anError = /be\sprogram/i;
    const child = Arg('foo');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const boundRequired = (Help as any).bind(null, 'help', null, child);

    expect(boundRequired).toThrow(anError);
  });
});
