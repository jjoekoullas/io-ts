import * as Benchmark from 'benchmark'
import { toDecodeError } from '../src/toDecodeError'
import { SpaceObject, invalid } from './SpaceObject'

const suite = new Benchmark.Suite()

suite
  .add('native', function() {
    SpaceObject.decode(invalid)
  })
  .add('toDecodeError', function() {
    SpaceObject.decode(invalid).mapLeft(toDecodeError)
  })
  .on('cycle', function(event: any) {
    console.log(String(event.target))
  })
  .on('complete', function(this: any) {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
