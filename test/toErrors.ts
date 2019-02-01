import * as assert from 'assert'
import * as t from '../src'
import { toDecodeError } from '../src/toDecodeError'
import { toErrors } from '../src/toErrors'

const assertRoundtrip = (type: t.Mixed, value: unknown) => {
  // console.log(type.decode(value).mapLeft(errors => toDecodeError(errors)))
  // console.log(type.decode(value).mapLeft(errors => toErrors(toDecodeError(errors), type)))
  // console.log(type.decode(value))
  assert.deepEqual(type.decode(value).mapLeft(errors => toErrors(toDecodeError(errors), type)), type.decode(value))
}

describe('toErrors', () => {
  it('string', () => {
    const T = t.string
    assertRoundtrip(T, null)
    assertRoundtrip(T, 'a')
  })

  it('type', () => {
    const T = t.type({
      name: t.string,
      age: t.number
    })
    assertRoundtrip(T, null)
    assertRoundtrip(T, {})
    assertRoundtrip(T, { name: 'name' })
    assertRoundtrip(T, { age: 0 })
    assertRoundtrip(T, { age: 'age' })
    assertRoundtrip(T, { name: 1 })
    assertRoundtrip(T, { name: 1, age: 'age' })
    assertRoundtrip(T, { name: 'name', age: 0 })
  })

  describe('record', () => {
    it('values', () => {
      const T = t.record(t.string, t.number)
      assertRoundtrip(T, null)
      assertRoundtrip(T, {})
      assertRoundtrip(T, { a: '1' })
      assertRoundtrip(T, { a: 1 })
    })

    it('keys', () => {
      const T = t.record(t.keyof({ a: null, b: null }), t.number)
      assertRoundtrip(T, { c: 1 })
    })
  })

  it('tuple', () => {
    const T = t.tuple([t.string, t.number])
    assertRoundtrip(T, null)
    assertRoundtrip(T, [])
    assertRoundtrip(T, ['a', 1])
    assertRoundtrip(T, [1, 1])
    assertRoundtrip(T, ['a', 'b'])
    assertRoundtrip(T, ['a', 1, true])
  })

  it('array', () => {
    const T = t.array(t.string)
    assertRoundtrip(T, null)
    assertRoundtrip(T, [])
    assertRoundtrip(T, ['a'])
    assertRoundtrip(T, ['a', 'b'])
    assertRoundtrip(T, ['a', 1])
  })

  it('union', () => {
    const T = t.union([t.string, t.number])
    assertRoundtrip(T, null)
    assertRoundtrip(T, 'a')
    assertRoundtrip(T, 1)
  })

  it('intersection', () => {
    const T = t.intersection([t.type({ a: t.string }), t.type({ b: t.number })])
    assertRoundtrip(T, null)
    assertRoundtrip(T, {})
    assertRoundtrip(T, { a: 'a', b: 1 })
    assertRoundtrip(T, { a: 'a' })
    assertRoundtrip(T, { b: 1 })
  })

  it('exact', () => {
    const T1 = t.exact(t.type({ a: t.string }))
    assertRoundtrip(T1, null)
    assertRoundtrip(T1, {})
    assertRoundtrip(T1, { a: 'a' })
    assertRoundtrip(T1, { a: 1 })
    assertRoundtrip(T1, { a: 'a', b: 1 })
    const T2 = t.exact(t.intersection([t.type({ a: t.string }), t.type({ b: t.number })]))
    assertRoundtrip(T2, null)
    assertRoundtrip(T2, {})
    assertRoundtrip(T2, { a: 'a' })
    assertRoundtrip(T2, { b: 1 })
    assertRoundtrip(T2, { a: 'a', b: 1 })
    assertRoundtrip(T2, { a: 'a', b: 1, c: true })
  })

  it('tagged unions', () => {
    const A = t.type({ type: t.literal('A') }, 'A')
    const B = t.type({ type: t.literal('B'), b: t.string }, 'B')
    const C = t.type({ type: t.literal('C') }, 'C')
    const SubUnion = t.union([A, B], 'Subunion')
    const T = t.taggedUnion('type', [SubUnion, C], 'T')
    assertRoundtrip(T, { type: 'B' })
  })
})
