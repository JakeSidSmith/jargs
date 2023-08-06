/* global describe, it */

import { expect } from 'chai';

import { Arg } from '../src/arg';
import { Help } from '../src/help';
import { Program } from '../src/program';

describe('help.js', function () {
  it('should construct a Help', function () {
    let node = Help('help', { alias: 'h' }, Program('foo'));

    expect(node).to.be.ok;
    expect(node).to.eql({
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

  it('should throw an error if alias is more than 1 char', function () {
    let anError = /length/;
    let node = Help.bind(null, 'foo', { alias: 'fo' });

    expect(node).to.throw(anError);
  });

  it('should throw an error if no children are supplied', function () {
    let anError = /child/i;

    expect(Help).to.throw(anError);
  });

  it('should throw an error if more than one children are supplied', function () {
    let anError = /child/i;
    let child1 = Arg('foo');
    let child2 = Arg('bar');
    let boundRequired = Help.bind(null, 'help', null, child1, child2);

    expect(boundRequired).to.throw(anError);
  });

  it('should throw an error if child is not a Program', function () {
    let anError = /be\sprogram/i;
    let child = Arg('foo');
    let boundRequired = Help.bind(null, 'help', null, child);

    expect(boundRequired).to.throw(anError);
  });
});
