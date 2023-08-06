/* global describe, it */

import { expect } from 'chai';

import { Arg } from '../src/arg';
import { RequireAny } from '../src/require-any';

describe('require-any.js', () => {
  it('should construct an RequireAll', () => {
    let child1 = Arg('foo');
    let child2 = Arg('bar');
    let node = RequireAny(child1, child2);

    expect(node).to.be.ok;
    expect(node).to.eql({
      _type: 'require-any',
      children: [child1, child2],
    });

    expect(node.children[0]).to.equal(child1);
    expect(node.children[1]).to.equal(child2);
  });

  it('should throw an error if no children are supplied', () => {
    let anError = /child/i;

    expect(RequireAny).to.throw(anError);
  });

  it(
    'should throw an error if less than 2 children are supplied',
    () => {
      let anError = /child/i;
      let child = Arg('foo');
      let boundRequired = RequireAny.bind(null, child);

      expect(boundRequired).to.throw(anError);
    }
  );
});
