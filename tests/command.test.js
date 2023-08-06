/* global describe, it */

import { expect } from 'chai';

import { Command } from '../src/command';

describe('command.js', () => {
  it('should construct a Command', () => {
    let child1 = Command('child1');
    let child2 = Command('child2');
    let node = Command('foo', { alias: 'bar' }, child1, child2);

    expect(node).to.be.ok;
    expect(node.name).to.equal('foo');
    expect(node.options).to.eql({
      alias: 'bar',
      description: '',
      usage: '',
      examples: [],
    });
    expect(node.children).to.eql([child1, child2]);
    expect(node._type).to.equal('command');
  });
});
