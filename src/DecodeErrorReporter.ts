import { DecodeError } from './DecodeError'
import { Either } from 'fp-ts/lib/Either'

export const failure = (error: DecodeError): Array<string> => {
  const go = (error: DecodeError, path: string): Array<string> => {
    switch (error.type) {
      case 'Leaf':
        return [`Invalid value ${JSON.stringify(error.actual)} supplied to : ${path + error.expected}`]
      case 'LabeledProduct':
        const r: Array<string> = []
        for (const key in error.errors) {
          const e = error.errors[key]
          r.push(...go(e, path + error.expected + '/' + key + ': '))
        }
        return r
      case 'IndexedProduct':
        return error.errors.reduce((acc: Array<string>, [key, e]) => {
          acc.push(...go(e, path + error.expected + '/' + key + ': '))
          return acc
        }, [])
      case 'And':
      case 'Or':
        return error.errors.reduce((acc: Array<string>, e) => {
          acc.push(...go(e, path + error.expected + '/_: '))
          return acc
        }, [])
    }
  }
  return go(error, '')
}

const empty: Array<never> = []

export const success = () => empty

export const DecodeErrorReporter = {
  report: <A>(result: Either<DecodeError, A>): Array<string> => result.fold(failure, success)
}
