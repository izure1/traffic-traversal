import type { ITrafficGraphState, GraphVertex } from './TrafficGraph'

import { useHashmap } from '@/Utils/Hashmap'
import { hasOwnProperty } from '@/Utils/Object'
import { first, last, copy } from '@/Utils/Array'

type Edge = { [key: string]: string }
type InQueue = { [key: string]: true }

export class TrafficTraversal {
  private readonly _trafficGraph: ITrafficGraphState
  private readonly _cEdge:        ReturnType<typeof useHashmap<Edge>>
  private readonly _cStrings:     ReturnType<typeof useHashmap<string[]>>
  private readonly _cNumber:      ReturnType<typeof useHashmap<number>>
  private readonly _cNumbers:     ReturnType<typeof useHashmap<[number, number]>>
  private readonly _cVertex:      ReturnType<typeof useHashmap<GraphVertex>>
  private readonly _cBoolean:     ReturnType<typeof useHashmap<boolean>>

  static Create(...args: ConstructorParameters<typeof TrafficTraversal>): TrafficTraversal {
    return new TrafficTraversal(...args)
  }

  /**
   * Create an instance that is responsible for the route and utility functions of the graph instance. It takes a `graph.state` instance as a parameter.
   * @param trafficGraphState 
   */
  constructor(trafficGraphState: ITrafficGraphState) {
    this._trafficGraph  = trafficGraphState
    this._cEdge         = useHashmap<Edge>()
    this._cStrings      = useHashmap<string[]>()
    this._cNumber       = useHashmap<number>()
    this._cNumbers      = useHashmap<[number, number]>()
    this._cVertex       = useHashmap<GraphVertex>()
    this._cBoolean      = useHashmap<boolean>()
  }

  protected _graphVertex(vertex: string): GraphVertex {
    return this._cVertex.ensure(`vertices from '${vertex}'`, () => {
      if (hasOwnProperty(this._trafficGraph.data, vertex)) {
        return this._trafficGraph.data[vertex]
      }
      return {}
    })
  }

  protected _isEdgeHaveGraphVertex(vertex: string, edge: string): boolean {
    return this._cBoolean.ensure(`vertex '${vertex}' has '${edge}' edge`, () => {
      return hasOwnProperty(this._graphVertex(vertex), edge)
    })
  }

  private _getTrafficPrev(from: string) {
    return this._cEdge.ensure(`traffic map from '${from}'`, () => {
      const queue: string[] = []
      const inQueue: InQueue = {}
      const distance: GraphVertex = {}
      const edge: Edge = {}

      for (const v of this._trafficGraph.vertices) {
        distance[v] = Infinity
        edge[v] = ''
      }
      distance[from] = 0
      inQueue[from] = true

      queue.push(from)
      while (queue.length) {
        const u = queue.shift()!
        const vertices = this._graphVertex(u)
        for (const v in vertices) {
          const d_u = distance[u]
          const d_v = distance[v]
          const w_uv = vertices[v]
          const cur = d_u + w_uv
          if (cur < d_v) {
            distance[v] = cur
            edge[v] = u
            if (!inQueue[v]) {
              inQueue[v] = true
              queue.push(v)
            }
          }
        }
      }
      return edge
    })
  }

  protected _getRoutes(from: string, to: string): string[] {
    const routes = this._cStrings.ensure(`route ${from} to ${to}`, () => {
      const inQueue: InQueue = {}
      const prev = this._getTrafficPrev(from)
      const routes = [to]
      let v = prev[to]
      while (v) {
        inQueue[v] = true
        routes.push(v)
        v = prev[v]
        if (v === from) {
          routes.push(from)
          break
        }
        // Infinity
        else if (inQueue[v]) {
          break
        }
      }
      routes.reverse()
      return routes
    })
    return routes
  }

  protected _reach(routes: string[], from: string, to: string): boolean {
    return first(routes) === from && last(routes) === to
  }

  /**
   * Finds the route with the lowest weight between two vertices and returns it as an array.
   * @param from This is the starting vertex.
   * @param to This is the target vertex.
   */
  routes(from: string, to: string): string[] {
    const routes = this._getRoutes(from, to)
    if (!this._reach(routes, from, to)) {
      throw new Error(`It is a structure that cannot be reached from vertex '${from}' to '${to}'.`)
    }
    return copy(routes)
  }

  private _addEdges(vertex: string, depth: number, curDepth: number, queue: string[], inQueue: InQueue): void {
    const gv = this._graphVertex(vertex)
    const done = curDepth === depth
    if (done) {
      return
    }
    for (const v in gv) {
      if (inQueue[v]) {
        continue
      }
      queue.push(v)
      inQueue[v] = true
      this._addEdges(v, depth, curDepth+1, queue, inQueue)
    }
  }

  /**
   * Returns a list of vertices adjacent to that vertex as an array. You can set a depth limit using the `depth` parameter.
   * @param vertex The vertex from which to start the search.
   * @param depth Set how deep to search from the vertex. If you specify this value as a negative number, the search is unrestricted. Default is `-1`.
   */
  edges(vertex: string, depth = -1): string[] {
    return this._cStrings.ensure(`edges from '${vertex}' with '${depth}' depth`, () => {
      const queue: string[] = []
      this._addEdges(vertex, depth, 0, queue, {})
      return queue
    })
  }

  /**
   * Returns whether the target vertex can be reached from the starting vertex.
   * @param from This is the starting vertex.
   * @param to This is the target vertex.
   */
  reachable(from: string, to: string): boolean {
    return this._reach(this._getRoutes(from, to), from, to)
  }

  /**
   * Returns the sum of the least weighted routes from the starting vertex to the target vertex.
   * @param from This is the starting vertex.
   * @param to This is the target vertex.
   */
  traffic(from: string, to: string): number {
    return this._cNumber.ensure(`traffic from '${from}' to '${to}'`, () => {
      const routes = this._getRoutes(from, to)
      if (!this._reach(routes, from, to)) {
        return Infinity
      } 
      let vertex = first(routes)
      let traffic = 0
      let i = 0
      while (vertex) {
        i++
        const next = routes[i]
        const gv = this._graphVertex(vertex)
        if (!this._isEdgeHaveGraphVertex(vertex, next)) {
          break
        }
        traffic += gv[next]
        vertex = next
      }
      return traffic
    })
  }

  weight(vertex: string, mode: 'traffic'|'number'|'mean'): number {
    const tuple = this._cNumbers.ensure(`weight tuple from '${vertex}'`, () => {
      let weight = 0
      let num = 0
      for (const k in this._trafficGraph.data) {
        if (!this._isEdgeHaveGraphVertex(k, vertex)) {
          continue
        }
        weight += this._trafficGraph.data[k][vertex]
        num++
      }
      return [weight, num]
    })
    switch (mode) {
      case 'traffic': return tuple[0]
      case 'number':  return tuple[1]
      case 'mean': {
        const mean = tuple[0] / tuple[1]
        return Number.isNaN(mean) ? 0 : mean
      }
      default: {
        throw new Error(`The '${mode}' mode is unsupported.`)
      }
    }
  }

  /**
   * Returns the shortest distance from the starting vertex to the target vertex. This is similar to the `distance` method, but takes direction into account. If unreachable, returns `Infinity`.
   * @param from This is the starting vertex.
   * @param to This is the target vertex.
   * @returns 
   */
  depth(from: string, to: string): number {
    return this._cNumber.ensure(`depth from '${from}' to '${to}'`, () => {
      const routes = this._getRoutes(from, to)
      if (!this._reach(routes, from, to)) {
        return Infinity
      }
      return routes.length-1
    })
  }

  /**
   * Returns the shortest distance between two vertices. This is similar to the `depth` method, but does not take direction into account.
   * @param a The vertex a.
   * @param b The vertex b.
   */
  distance(a: string, b: string): number {
    return Math.min(this.depth(a, b), this.depth(b, a))
  }
}
