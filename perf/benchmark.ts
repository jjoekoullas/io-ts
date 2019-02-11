import * as Benchmark from 'benchmark'
import { SpaceObject, valid, invalid } from './SpaceObject'
import { toDecodeError } from '../src/toDecodeError'

const suite = new Benchmark.Suite()

suite
  .add('SpaceObject (valid)', function() {
    SpaceObject.decode(valid)
  })
  .add('SpaceObject (invalid, Errors)', function() {
    SpaceObject.decode(invalid)
  })
  .add('SpaceObject (invalid, DecodeError)', function() {
    SpaceObject.decode(invalid).mapLeft(toDecodeError)
  })
  .on('cycle', function(event: any) {
    console.log(String(event.target))
  })
  .on('complete', function(this: any) {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
