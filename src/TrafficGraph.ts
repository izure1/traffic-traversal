import { has } from '@/Utils/Array'
import { deepCopy, hasOwnProperty } from '@/Utils/Object'


export type GraphVertex = Record<string, number>
export type TrafficGraphData = Record<string, GraphVertex>
type InQueue = { [key: string]: true }

export interface ITrafficGraphState {
  readonly data: Readonly<TrafficGraph['data']>
  readonly vertices: Readonly<TrafficGraph['vertices']>
  readonly timestamp: number
}

export class TrafficGraph {
  /**
   * It is an object that contains weight information between the vertex of the graph.
   */
  private readonly _data: TrafficGraphData

  /**
   * Create a new graph instance. You can generate from existing data using `data` parameters.
   * @param data You can restore it with existing data.This data can be obtained by `TrafficGraph.data`.
   */
  constructor(data: TrafficGraphData = {}) {
    this._data = data
  }

  static Create(...args: ConstructorParameters<typeof TrafficGraph>): TrafficGraph {
    return new TrafficGraph(...args)
  }

  /**
   * Returns to an array in the form that can serialize the graph information of the current instance.
   */
  get data(): TrafficGraphData {
    return deepCopy(this._data)
  }

  /**
   * The current status of the instance is exported to an immutable object.
   */
  get state(): Readonly<ITrafficGraphState> {
    const data = Object.freeze(this.data)
    const vertices = Object.freeze(this.vertices)
    const timestamp = Date.now()
    const state: Readonly<ITrafficGraphState> = Object.freeze({
      data,
      vertices,
      timestamp
    })
    return state
  }

  /**
   * Returns all the vertices listed in the current instance in an array.
   */
  get vertices(): string[] {
    const inQueue: InQueue = {}
    const vertices: string[] = []
    for (const k in this._data) {
      if (!hasOwnProperty(inQueue, k)) {
        inQueue[k] = true
        vertices.push(k)
      }
      const gv = this._data[k]
      for (const v in gv) {
        if (!hasOwnProperty(inQueue, v)) {
          inQueue[v] = true
          vertices.push(v)
        }
      }
    }
    return vertices
  }

  /**
   * Currently copied instance and returns to a new instance.
   */
  get clone(): TrafficGraph {
    return new TrafficGraph(this._data)
  }

  private _graphVertex(vertex: string): GraphVertex {
    return hasOwnProperty(this._data, vertex) ? this._data[vertex] : {}
  }

  /**
   * Create a single direction weight route. It is possible to traverse the `source` to `dest`, but vice versa is impossible.
   * If you had the same vertex before, the value is overwritten.
   * @param source The starting vertex.
   * @param dest This is a list of weights of each vertex.
   */
  to(source: string, dest: GraphVertex): this {
    if (!hasOwnProperty(this._data, source)) {
      this._data[source] = {}
    }
    const gv = this._graphVertex(source)
    for (const v in dest) {
      if (source === v) {
        continue
      }
      const w = dest[v]
      gv[v] = w
    }
    return this
  }

  /**
   * Set the weight route that leads to both directions between the two vertices. 'a' vertex and 'b' vertex can traverse to each other.
   * For example, `graph.both('a', { b: 1 })` is same as `graph.to('a', { b: 1 }).to('b', { a: 1 })`
   * @param a The vertex a.
   * @param b This is a list of weights of each vertex.
   */
  both(a: string, b: GraphVertex): this {
    this.to(a, b)
    for (const v in b) {
      const gv: GraphVertex = {}
      const w = b[v]
      gv[a] = w
      this.to(v, gv)
    }
    return this
  }

  /**
   * Set the weight between all vertices passed by parameters.
   * For example, `graph.all({ a: 1, b: 2, c: 3 })` is same as `graph.to('a', { b: 2, c: 3 }).to('b', { a: 1, c: 3 }).to('c', { a: 1, b: 2 })`
   * @param dest This is a list of weights of each vertex.
   */
  all(dest: GraphVertex): this {
    for (const v in dest) {
      this.to(v, dest)
    }
    return this
  }

  /**
   * Delete the single direction weight route created by the `to` method.
   * @param source The starting vertex.
   * @param dest The target vertex.
   */
  unlinkTo(source: string, dest: string): this {
    const gv = this._graphVertex(source)
    delete gv[dest]
    return this
  }

  /**
   * Delete the bidirectional weight route created by the `both` method.
   * @param a The vertex a.
   * @param b The vertex b.
   */
  unlinkBoth(a: string, b: string): this {
    this.unlinkTo(a, b)
    this.unlinkTo(b, a)
    return this
  }

  /**
   * Delete certain vertices. All weight routes connected to the vertex are deleted.
   * @param vertex The vertex what you want to delete.
   */
  drop(vertex: string): this {
    for (const v in this._data) {
      const gv = this._data[v]
      delete gv[vertex]
    }
    delete this._data[vertex]
    return this
  }

  /**
   * It returns whether the instance has a vertex.
   * @param vertex The vertex what you want to check.
   */
  has(vertex: string): boolean {
    return this.vertices.includes(vertex)
  }

  /**
   * It returns whether all the vertices exist in that instance. Returns `false` if any of the vertices are missing.
   * @param vertices The vertices what you want to check.
   */
  hasAll(...vertices: string[]): boolean {
    return has(this.vertices, ...vertices)
  }

  /**
   * Invert all weights in an instance. For example, when A to B has a `2` weight, it will be `-2`.
   * It's useful for switching the shortest to longest routes or minimum to maximum traffic in a graph.
   * @example
   * const inverted = TrafficTraversal.Create(traffic.invert().state)
   * const longest = invertedTraversal.routes('A', 'B')
   */
  invert(): this {
    for (const k in this._data) {
      const gv = this._data[k]
      for (const v in gv) {
        gv[v] *= -1
      }
    }
    return this
  }
}
