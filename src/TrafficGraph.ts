import { has } from './Utils/Array'
import { copy, ensure } from './Utils/Array'
import { deepCopy, setObjectMap } from './Utils/Object'

export type GraphVertexCalc = Record<string, string>
export type GraphVertex = Record<string, number>
export type TrafficGraphData = {
  vertex: Record<string, GraphVertex>
  embedded: string[]
}
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
  constructor(data: TrafficGraphData = setObjectMap({
    vertex: {},
    embedded: []
  })) {
    this._data = data
  }

  static Create(...args: ConstructorParameters<typeof TrafficGraph>): TrafficGraph {
    return new TrafficGraph(...args)
  }

  /**
   * Returns to an array in the form that can serialize the graph information of the current instance.
   */
  get data(): TrafficGraphData {
    const clone = deepCopy(this._data)
    for (const k in clone.vertex) {
      const gv = clone.vertex[k]
      setObjectMap(gv)
    }
    return setObjectMap(clone)
  }

  /**
   * The current status of the instance is exported to an immutable object.
   */
  get state(): Readonly<ITrafficGraphState> {
    const data = Object.freeze(this.data)
    const vertices = Object.freeze(this.vertices)
    const timestamp = Date.now()
    const state = Object.freeze({
      data,
      vertices,
      timestamp
    } as ITrafficGraphState)
    return state
  }

  /**
   * Returns all the vertices listed in the current instance in an array.
   */
  get vertices(): string[] {
    const inQueue: InQueue = setObjectMap({})
    const vertices: string[] = []
    for (const k in this._data.vertex) {
      if (!(k in inQueue)) {
        inQueue[k] = true
        vertices.push(k)
      }
      const gv = this._data.vertex[k]
      for (const v in gv) {
        if (!(v in inQueue)) {
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
    return vertex in this._data.vertex ? this._data.vertex[vertex] : setObjectMap({})
  }

  private _embed(vertex: string): void {
    ensure(this._data.embedded, vertex)
  }

  private _calculate(vertices: GraphVertex, vertex: string, calc: string): number {
    const before  = vertex in vertices ? vertices[vertex] : 0
    const symbol  = calc.substring(0, 2)
    const value   = Number(calc.substring(2))
    switch (symbol) {
      case '+=': {
        return before + value
      }
      case '-=': {
        return before - value
      }
      case '*=': {
        return before * value
      }
      case '/=': {
        return before / value
      }
      default: {
        throw new Error(`The string formula that can be used is as follows: +=, -=, *=, /=`)
      }
    }
  }

  /**
   * Create a single direction weight route. It is possible to traverse the `source` to `dest`, but vice versa is impossible.
   * If you had the same vertex before, the value is overwritten.
   * @param source The starting vertex.
   * @param dest This is a list of weights of each vertex. You can specify relative values. If you fill in the prior character `+=`, `-=`, `*=`, `/=`, The target value is calculated based on the current value of the property.
   * @example
   * graph.to('a', { b: 1 })
   * graph.to('a', { b: '+=1' })
   */
  to(source: string, dest: GraphVertex|GraphVertexCalc): this {
    if (!(source in this._data.vertex)) {
      this._data.vertex[source] = setObjectMap({})
      this._embed(source)
    }
    const gv = this._graphVertex(source)
    for (const v in dest) {
      if (source === v) {
        continue
      }
      let w = dest[v]
      if (typeof w === 'string') {
        w = this._calculate(gv, v, w)
      }
      gv[v] = w
      this._embed(v)
    }
    return this
  }

  /**
   * Set the weight route that leads to both directions between the two vertices. 'a' vertex and 'b' vertex can traverse to each other.
   * For example, `graph.both('a', { b: 1 })` is same as `graph.to('a', { b: 1 }).to('b', { a: 1 })`
   * @param a The vertex a.
   * @param b This is a list of weights of each vertex. You can specify relative values. If you fill in the prior character `+=`, `-=`, `*=`, `/=`, The target value is calculated based on the current value of the property.
   * @example
   * graph.both('a', { b: 1 })
   * graph.both('a', { b: '+=1' })
   */
  both(a: string, b: GraphVertex|GraphVertexCalc): this {
    this.to(a, b)
    for (const v in b) {
      const gv: GraphVertex|GraphVertexCalc = setObjectMap({})
      const w = b[v]
      gv[a] = w
      this.to(v, gv)
    }
    return this
  }

  /**
   * Set the weight between all vertices passed by parameters.
   * For example, `graph.all({ a: 1, b: 2, c: 3 })` is same as `graph.to('a', { b: 2, c: 3 }).to('b', { a: 1, c: 3 }).to('c', { a: 1, b: 2 })`
   * @param dest This is a list of weights of each vertex. You can specify relative values. If you fill in the prior character `+=`, `-=`, `*=`, `/=`, The target value is calculated based on the current value of the property.
   * @example
   * graph.all({ a: 1, b: 2, c: 3 })
   * graph.all({ a: '+=1', b: '+=1', c: '+=1' })
   */
  all(dest: GraphVertex|GraphVertexCalc): this {
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
    for (const v in this._data.vertex) {
      const gv = this._data.vertex[v]
      delete gv[vertex]
    }
    delete this._data.vertex[vertex]
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
    for (const k in this._data.vertex) {
      const gv = this._data.vertex[k]
      for (const v in gv) {
        gv[v] *= -1
      }
    }
    return this
  }
}
