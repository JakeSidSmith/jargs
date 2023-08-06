/* global describe, it */

import { Command } from '../src/command';
import { Program } from '../src/program';

describe('program.js', () => {
  it('should construct a Program', () => {
    let child1 = Command('child1');
    let child2 = Command('child2');
    let node = Program('foo', null, child1, child2);

    expect(node).toBeTruthy();
    expect(node).toEqual({
      _globals: {},
      _type: 'program',
      _requireAll: [],
      _requireAny: [],
      name: 'foo',
      options: {
        description: '',
        usage: '',
        examples: [],
      },
      children: [child1, child2],
    });
  });
});
