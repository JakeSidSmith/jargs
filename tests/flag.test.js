/* global describe, it */

import { expect } from 'chai';

import { Flag } from '../src/flag';

describe('flag.js', function () {
  it('should construct a Flag', function () {
    let node = Flag('foo', { alias: 'f' });

    expect(node).to.be.ok;
    expect(node.name).to.equal('foo');
    expect(node.options).to.eql({ alias: 'f', description: '' });
    expect(node.children).to.be.undefined;
    expect(node._type).to.equal('flag');
  });

  it('should throw an error if alias is more than 1 char', function () {
    let anError = /length/;
    let node = Flag.bind(null, 'foo', { alias: 'fo' });

    expect(node).to.throw(anError);
  });

  it('should throw an error if has children', function () {
    let anError = /children/i;

    expect(Flag.bind(null, 'foo', null, 'child')).to.throw(anError);
  });
});
