# traffic-traversal

[![](https://data.jsdelivr.com/v1/package/npm/traffic-traversal/badge)](https://www.jsdelivr.com/package/npm/traffic-traversal)

Calculate the weights between each vertex node and help you find the fastest route.

```typescript
import { TrafficGraph, TrafficTraversal } from 'traffic-traversal'

const graph = TrafficGraph.Create()

graph.to('start', {
  b: 10,
  c: 20
}).to('b', { goal: 5 }).to('c', { goal: 5 })

const traversal = TrafficTraversal.Create(graph.state)

traversal.routes('start', 'goal') // ['start', 'b', 'goal']

traversal.traffic('start', 'goal') // 15
traversal.traffic('goal', 'start') // Infinity

traversal.reachable('start', 'goal') // true
traversal.reachable('goal', 'start') // false

traversal.depth('start', 'goal') // 2
traversal.depth('goal', 'start') // Infinity

traversal.distance('start', 'goal') // 2
traversal.distance('goal', 'start') // 2

traversal.edges('start') // ['b', 'c', 'goal']
traversal.edges('start', 1) // ['b', 'c']
```

## Method

### `TrafficGraph`

#### `constructor`(data?: `TrafficGraphData`)

Create a new graph instance. You can generate from existing data using `data` parameters.

#### (getter) `data`: `TrafficGraphData`

Returns to an array in the form that can serialize the graph information of the current instance.

#### (getter) `state`: `Readonly<ITrafficGraphState>`

The current status of the instance is exported to an immutable object.

#### (getter) `vertices`: `string[]`

Returns all the vertices listed in the current instance in an array.

#### (getter) `clone`: `TrafficGraph`

Currently copied instance and returns to a new instance.

#### `to`(source: `string`, dest: `GraphVertex`): `this`

Create a single direction weight route. It is possible to traverse the `source` to `dest`, but vice versa is impossible. If you had the same vertex before, the value is overwritten.

You can specify relative values. If you fill in the prior character `+=`, `-=`, `*=`, `/=`, The target value is calculated based on the current value of the property.

#### `both`(a: `string`, b: `GraphVertex`): `this`

Set the weight route that leads to both directions between the two vertices. 'a' vertex and 'b' vertex can traverse to each other.

For example, `graph.both('a', { b: 1 })` is same as `graph.to('a', { b: 1 }).to('b', { a: 1 })`

You can specify relative values. If you fill in the prior character `+=`, `-=`, `*=`, `/=`, The target value is calculated based on the current value of the property.

#### `all`(dest: `GraphVertex`): `this`

Set the weight between all vertices passed by parameters.

For example, `graph.all({ a: 1, b: 2, c: 3 })` is same as `graph.to('a', { b: 2, c: 3 }).to('b', { a: 1, c: 3 }).to('c', { a: 1, b: 2 })`

You can specify relative values. If you fill in the prior character `+=`, `-=`, `*=`, `/=`, The target value is calculated based on the current value of the property.

#### `unlinkTo`(source: `string`, dest: `string`): `this`

Delete the single direction weight route created by the `to` method.

#### `unlinkBoth`(a: `string`, b: `string`): `this`

Delete the bidirectional weight route created by the `both` method.

#### `drop`(vertex: `string`): `this`

Delete certain vertices. All weight routes connected to the vertex are deleted.

#### `has`(vertex: `string`): `boolean`

It returns whether the instance has a vertex.

#### `hasAll`(...vertices: `string[]`): `boolean`

It returns whether all the vertices exist in that instance. Returns `false` if any of the vertices are missing.

#### `invert`(): `this`

Invert all weights in an instance. For example, when A to B has a `2` weight, it will be `-2`.
It's useful for switching the shortest to longest routes or minimum to maximum traffic in a graph.

### `TrafficTraversal`

#### `constructor`(trafficGraphState: `ITrafficGraphState`)

Create an instance that is responsible for the route and utility functions of the graph instance. It takes a `graph.state` instance as a parameter.

#### `routes`(from: `string`, to: `string`): `string[]`

Finds the route with the lowest weight between two vertices and returns it as an array.

#### `edges`(vertex: `string`, depth = `-1`): `string[]`

Returns a list of vertices adjacent to that vertex as an array. You can set a depth limit using the `depth` parameter.

#### `reachable`(from: `string`, to: `string`): `boolean`

Returns whether the target vertex can be reached from the starting vertex.

#### `traffic`(from: `string`, to: `string`): `number`

Returns the sum of the least weighted routes from the starting vertex to the target vertex. If unreachable, returns `Infinity`.

#### `depth`(from: `string`, to: `string`): `number`

Returns the shortest distance from the starting vertex to the target vertex. This is similar to the `distance` method, but takes direction into account. If unreachable, returns `Infinity`.

#### `distance`(a: `string`, b: `string`): `number`

Returns the shortest distance between two vertices. This is similar to the `depth` method, but does not take direction into account. If unreachable, returns `Infinity`.

## Install

### Node.js (cjs)

```bash
npm i traffic-traversal
```

### Browser (esm)

```html
<script type="module">
  import { TrafficGraph, TrafficTraversal } from 'https://cdn.jsdelivr.net/npm/traffic-traversal@1.x.x/dist/esm/index.min.js'
</script>
```

## License

MIT LICENSE
