import * as index from '../src/index';

describe('index.js', () => {
  it('should export some stuff', () => {
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

    expect(index).toBeTruthy();

    for (let key in index) {
      expect(key in keyTypeMap).toBe(true);
      expect(typeof index[key]).toBe(keyTypeMap[key]);
    }
  });
});
