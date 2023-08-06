/* global describe, it */

import { expect } from 'chai';

import * as index from '../src/index';

describe('index.js', function () {
  it('should export some stuff', function () {
    let keyTypeMap = {
      collect: 'function',
      Help: 'function',
      Program: 'function',
      Command: 'function',
      KWArg: 'function',
      Flag: 'function',
      Arg: 'function',
      Required: 'function',
      RequireAll: 'function',
      RequireAny: 'function',
    };

    expect(index).to.be.ok;

    for (let key in index) {
      expect(key in keyTypeMap).to.be.true;
      expect(typeof index[key]).to.equal(keyTypeMap[key]);
    }
  });
});
