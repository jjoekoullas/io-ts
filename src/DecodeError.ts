//
// v2 error model
//

export type DecodeError =
  | Leaf
  | LabeledProduct // suitable for product types indexed by labels
  | IndexedProduct // suitable for product types indexed by integers
  | And // suitable for intersection types
  | Or // suitable for union types

export interface Leaf {
  type: 'Leaf'
  actual: unknown
  expected: string
  message: string | undefined
}

export interface LabeledProduct {
  type: 'LabeledProduct'
  actual: unknown
  expected: string
  errors: Record<string, DecodeError>
  message: string | undefined
}

export interface IndexedProduct {
  type: 'IndexedProduct'
  actual: unknown
  expected: string
  errors: Array<[number, DecodeError]>
  message: string | undefined
}

export interface And {
  type: 'And'
  actual: unknown
  expected: string
  errors: Array<DecodeError>
  message: string | undefined
}

export interface Or {
  type: 'Or'
  actual: unknown
  expected: string
  errors: Array<DecodeError>
  message: string | undefined
}

export const leaf = (actual: unknown, expected: string, message?: string): DecodeError => ({
  type: 'Leaf',
  actual,
  expected,
  message
})

export const labeledProduct = (
  actual: unknown,
  expected: string,
  errors: Record<string, DecodeError>,
  message?: string
): DecodeError => ({
  type: 'LabeledProduct',
  actual,
  expected,
  errors,
  message
})

export const indexedProduct = (
  actual: unknown,
  expected: string,
  errors: Array<[number, DecodeError]>,
  message?: string
): DecodeError => ({
  type: 'IndexedProduct',
  actual,
  expected,
  errors,
  message
})

export const and = (actual: unknown, expected: string, errors: Array<DecodeError>, message?: string): DecodeError => ({
  type: 'And',
  actual,
  expected,
  errors,
  message
})

export const or = (actual: unknown, expected: string, errors: Array<DecodeError>, message?: string): DecodeError => ({
  type: 'Or',
  actual,
  expected,
  errors,
  message
})
