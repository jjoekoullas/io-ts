import { ValidationError } from '.'
import { DecodeError, IndexedProduct, LabeledProduct } from './DecodeError'
import { Reporter } from './Reporter'
import { toDecodeError } from './toDecodeError'

class Tree<A> {
  constructor(readonly value: A, readonly forest: Array<Tree<A>>) {}
}

const draw = (indentation: string, forest: Array<Tree<string>>): string => {
  let r: string = ''
  const len = forest.length
  let tree: Tree<string>
  for (let i = 0; i < len; i++) {
    tree = forest[i]
    const isLast = i === len - 1
    r += indentation + (isLast ? '└' : '├') + '─ ' + tree.value
    r += draw(indentation + (len > 1 && !isLast ? '│  ' : '   '), tree.forest)
  }
  return r
}

const drawTree = (tree: Tree<string>): string => {
  return tree.value + draw('\n', tree.forest)
}

const toArray = (error: LabeledProduct | IndexedProduct): Array<[string | number, DecodeError]> => {
  switch (error.type) {
    case 'LabeledProduct':
      const r: Array<[string | number, DecodeError]> = []
      for (const key in error.errors) {
        r.push([key, error.errors[key]])
      }
      return r
    case 'IndexedProduct':
      return error.errors
  }
}

const getErrorMessage = (error: DecodeError, fallback: () => string) => {
  return error.message === undefined ? fallback() : error.message
}

const toTree = (error: DecodeError): Tree<string> => {
  const toTree = (error: DecodeError, withValue: boolean): Tree<string> => {
    switch (error.type) {
      case 'Leaf':
        return new Tree(
          getErrorMessage(error, () => `Expected ${error.expected}, but was ${JSON.stringify(error.actual)}`),
          []
        )
      case 'LabeledProduct':
      case 'IndexedProduct':
        return new Tree(
          getErrorMessage(error, () =>
            withValue
              ? `Expected ${error.expected}, but was ${JSON.stringify(error.actual, null, 2)}`
              : `Invalid ${error.expected}`
          ),
          toArray(error).reduce((acc: Array<Tree<string>>, [key, e]) => {
            acc.push(new Tree(getErrorMessage(e, () => `Invalid key ${JSON.stringify(key)}`), [toTree(e, false)]))
            return acc
          }, [])
        )
      case 'And':
      case 'Or':
        return new Tree(
          getErrorMessage(error, () =>
            withValue
              ? `Expected ${error.expected}, but was ${JSON.stringify(error.actual, null, 2)}`
              : `Invalid ${error.expected}`
          ),
          error.errors.map(error => toTree(error, false))
        )
    }
  }
  return toTree(error, true)
}

export const failure = (es: Array<ValidationError>): string => {
  return drawTree(toTree(toDecodeError(es)))
}

export const success = () => 'No errors!'

export const TreeReporter: Reporter<string> = {
  report: validation => validation.fold(failure, success)
}
