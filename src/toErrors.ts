import * as t from '.'
import { DecodeError } from './DecodeError'

const getContextEntry = (decodeError: DecodeError, key: string, codec: t.Any): t.ContextEntry => {
  return {
    key,
    type: codec,
    actual: decodeError.actual
  }
}

export const toErrors = (decodeError: DecodeError, codec: any): t.Errors => {
  const errors: t.Errors = []
  const visit = (decodeError: DecodeError, context: t.Context, codec: any) => {
    switch (decodeError.type) {
      case 'Leaf':
        errors.push({ value: decodeError.actual, context, message: decodeError.message })
        break
      case 'LabeledProduct':
        if (codec._tag === 'ExactType' || codec._tag === 'ReadonlyType' || codec._tag === 'RecursiveType') {
          visit(decodeError, context, codec.type)
          break
        }
        Object.keys(decodeError.errors).forEach(key => {
          const next = decodeError.errors[key]
          const nextCodec =
            codec._tag === 'DictionaryType'
              ? next.expected === codec.domain.name
                ? codec.domain
                : codec.codomain
              : codec.props[key]
          visit(next, t.appendContext(context, key, nextCodec, next.actual), nextCodec)
        })
        break

      case 'IndexedProduct':
        decodeError.errors.forEach(([index, next]) => {
          const nextCodec = codec._tag === 'TupleType' ? codec.types[index] : codec.type
          visit(next, t.appendContext(context, String(index), nextCodec, next.actual), nextCodec)
        })
        break
      case 'Or':
        decodeError.errors.forEach(next => {
          const index = codec.types.findIndex((codec: t.Any) => codec.name === next.expected)
          const nextCodec = codec.types[index]
          visit(next, t.appendContext(context, String(index), nextCodec, next.actual), nextCodec)
        })
        break
      case 'And':
        if (codec._tag === 'ExactType') {
          visit(decodeError, context, codec.type)
          break
        }
        decodeError.errors.forEach(next => {
          const index = codec.types.findIndex((codec: t.Any) => codec.name === next.expected)
          const nextCodec = codec.types[index]
          visit(next, t.appendContext(context, String(index), nextCodec, next.actual), nextCodec)
        })
        break
    }
  }
  visit(decodeError, [getContextEntry(decodeError, '', codec)], codec)
  return errors
}
