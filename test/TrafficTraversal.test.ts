import { TrafficGraph } from '../src/TrafficGraph'
import { TrafficTraversal } from '../src/TrafficTraversal'

describe('TrafficGraph', () => {
  let graph: TrafficGraph
  let graphNegative: TrafficGraph
  let traversal: TrafficTraversal
  let traversalNegative: TrafficTraversal

  beforeEach(() => {
    graph = TrafficGraph.Create()
    graph.to('a', {
      b: 1,
      c: 2
    }).to('b', {
      d: 2
    }).to('c', {
      d: 2
    }).to('A', {
      B: 1,
      C: 2
    }).to('B', {
      D: 2
    }).to('C', {
      D: 2
    }).to('0', {
      1: 4,
      2: 2
    }).to('1', {
      3: 10,
      2: 5
    }).to('2', {
      4: 3
    }).to('4', {
      3: 4
    }).to('3', {
      5: 11
    })

    graphNegative = TrafficGraph.Create()
    graphNegative.to('a', {
      b: -1,
      c: -2
    }).to('b', {
      d: -2
    }).to('c', {
      d: -2
    })

    traversal = TrafficTraversal.Create(graph.state)
    traversalNegative = TrafficTraversal.Create(graphNegative.state)
  })

  test('TrafficGraph.data', () => {
    expect(graph.data.a).toEqual({ b: 1, c: 2 })
  })

  test('TrafficGraph.vertices', () => {
    expect(graph.vertices.sort()).toEqual(['0', '1', '2', '3', '4', '5', 'A', 'B', 'C', 'D', 'a', 'b', 'c', 'd'])
  })

  test('TrafficGraph.has', () => {
    expect(graph.has('a')).toBe(true)
    expect(graph.has('e')).toBe(false)
  })

  test('TrafficGraph.hasAll', () => {
    expect(graph.hasAll('a', 'b', 'c')).toBe(true)
    expect(graph.hasAll('a', 'b', 'c', 'e')).toBe(false)
  })

  test('TrafficGraph.unlinkTo', () => {
    graph.unlinkTo('a', 'b')
    const traversal = TrafficTraversal.Create(graph.state)
    expect(traversal.traffic('a', 'd')).toBe(4)
  })

  test('TrafficGraph.unlinkBoth', () => {
    graph.unlinkBoth('a', 'b')
    const traversal = TrafficTraversal.Create(graph.state)
    expect(traversal.traffic('a', 'd')).toBe(4)
  })

  test('TrafficGraph.drop', () => {
    graph.drop('b')
    const traversal = TrafficTraversal.Create(graph.state)
    expect(traversal.traffic('a', 'd')).toBe(4)
  })

  test('TrafficTraversal.reachable', () => {
    expect(traversal.reachable('a', 'C')).toBe(false)
  })

  test('TrafficTraversal.traffic', () => {
    expect(traversal.traffic('a', 'a')).toBe(0)
    expect(traversal.traffic('a', 'd')).toBe(3)
    expect(traversal.traffic('0', '5')).toBe(20)
    expect(traversal.routes('a', 'd')).toEqual(['a', 'b', 'd'])

    expect(traversalNegative.traffic('a', 'd')).toBe(-4)
    expect(traversalNegative.routes('a', 'd')).toEqual(['a', 'c', 'd'])
  })

  test('TrafficTraversal.depth', () => {
    expect(traversal.depth('a', 'a')).toBe(0)
    expect(traversal.depth('a', 'd')).toBe(2)
    expect(traversal.depth('d', 'a')).toBe(Infinity)
    expect(traversal.depth('d', 'C')).toBe(Infinity)
  })

  test('TrafficTraversal.distance', () => {
    expect(traversal.distance('a', 'a')).toBe(0)
    expect(traversal.distance('a', 'd')).toBe(2)
    expect(traversal.distance('d', 'a')).toBe(2)
  })

  test('TrafficTraversal.edges', () => {
    expect(traversal.edges('a').sort()).toEqual(['b', 'c', 'd'])
    expect(traversal.edges('a', 0).sort()).toEqual([])
    expect(traversal.edges('a', 1).sort()).toEqual(['b', 'c'])
    expect(traversal.edges('a', 2).sort()).toEqual(['b', 'c', 'd'])
    expect(traversal.edges('a', 100).sort()).toEqual(['b', 'c', 'd'])
  })
})