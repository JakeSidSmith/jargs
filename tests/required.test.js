/* global describe, it */

import { expect } from 'chai';

import { Arg } from '../src/arg';
import { Required } from '../src/required';

describe('required.js', function () {
  it('should construct an Required', function () {
    let child = Arg('foo');
    let node = Required(child);

    expect(node).to.be.ok;
    expect(node).to.eql({
      _type: 'required',
      children: [child],
    });

    expect(node.children[0]).to.equal(child);
  });

  it('should throw an error if no children are supplied', function () {
    let anError = /child/i;

    expect(Required).to.throw(anError);
  });

  it('should throw an error if more than one children are supplied', function () {
    let anError = /child/i;
    let child1 = Arg('foo');
    let child2 = Arg('bar');
    let boundRequired = Required.bind(null, child1, child2);

    expect(boundRequired).to.throw(anError);
  });
});
