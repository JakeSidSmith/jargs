/* global describe, it */

import { expect } from 'chai';

import { Arg } from '../src/arg';

describe('arg.js', function () {
  it('should construct an Arg', function () {
    let node = Arg('foo', null);

    expect(node).to.be.ok;
    expect(node.name).to.equal('foo');
    expect(node.options).to.eql({ description: '', multi: false });
    expect(node.children).to.be.undefined;
    expect(node._type).to.equal('arg');
  });

  it('should throw an error if has children', function () {
    let anError = /children/i;

    expect(Arg.bind(null, 'foo', null, 'child')).to.throw(anError);
  });
});
