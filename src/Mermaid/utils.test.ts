import { deepMerge } from './utils';

describe('deepMerge', () => {
  it('merges shallow objects', () => {
    const a = { foo: 1, bar: 2 };
    const b = { bar: 3, baz: 4 };
    expect(deepMerge(a, b)).toEqual({ foo: 1, bar: 3, baz: 4 });
  });

  it('merges nested objects', () => {
    const a = { foo: { x: 1, y: 2 }, bar: 2 };
    const b = { foo: { y: 3, z: 4 }, baz: 5 };
    expect(deepMerge(a, b)).toEqual({ foo: { x: 1, y: 3, z: 4 }, bar: 2, baz: 5 });
  });

  it('overwrites arrays instead of merging', () => {
    const a = { arr: [1, 2, 3] };
    const b = { arr: [4, 5] };
    expect(deepMerge(a, b)).toEqual({ arr: [4, 5] });
  });

  it('handles non-object values', () => {
    const a = { foo: 1 };
    const b = { foo: null, bar: undefined, baz: false };
    expect(deepMerge(a, b)).toEqual({ foo: null, bar: undefined, baz: false });
  });

  it('returns a new object and does not mutate inputs', () => {
    const a = { foo: { x: 1 } };
    const b = { foo: { y: 2 } };
    const result = deepMerge(a, b);
    expect(result).not.toBe(a);
    expect(result).not.toBe(b);
    expect(result.foo).not.toBe(a.foo);
    expect(result.foo).not.toBe(b.foo);
  });
}); 