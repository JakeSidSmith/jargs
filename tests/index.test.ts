import * as index from '../src/index';

describe('index.js', () => {
  it('should export some stuff', () => {
    const keyTypeMap: Record<string, string> = {
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
      NodeType: 'object',
    };

    expect(index).toBeTruthy();

    Object.entries(index).forEach(([key, value]) => {
      expect(key in keyTypeMap).toBe(true);
      expect(typeof value).toBe(keyTypeMap[key]);
    });
  });
});
