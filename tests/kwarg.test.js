/* global describe, it */

import { expect } from 'chai';

import { KWArg } from '../src/kwarg';

describe('kwarg.js', function () {
  it('should construct a KWArg', function () {
    let node = KWArg('foo', { alias: 'f' });

    expect(node).to.be.ok;
    expect(node.name).to.equal('foo');
    expect(node.options).to.eql({
      alias: 'f',
      description: '',
      multi: false,
    });
    expect(node.children).to.be.undefined;
    expect(node._type).to.equal('kwarg');
  });

  it('should throw an error if alias is more than 1 char', function () {
    let anError = /length/;
    let node = KWArg.bind(null, 'foo', { alias: 'fo' });

    expect(node).to.throw(anError);
  });

  it('should throw an error if has children', function () {
    let anError = /children/i;

    expect(KWArg.bind(null, 'foo', null, 'child')).to.throw(anError);
  });
});
