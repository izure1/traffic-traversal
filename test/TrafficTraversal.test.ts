import { TrafficGraph } from '../src/TrafficGraph'
import { TrafficTraversal } from '../src/TrafficTraversal'

import { VertexEncoder } from '../src/Helpers/VertexEncoder'

describe('Core', () => {
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
    graphNegative.to('1', {
      2: -.061,
      3: -.061,
      4: -.061,
      5: -.061,
      7: -.061,
    }).to('2', {
      1: -.166
    }).to('3', {
      1: -.071
    }).to('4', {
      2: -.035,
      5: -.035,
    }).to('5', {
      1: -.045,
      4: -.045,
      6: -.045,
    }).to('6', {
      1: -.023,
      5: -.023,
    }).to('7', {
      5: -.179
    })

    traversal = TrafficTraversal.Create(graph.state)
    traversalNegative = TrafficTraversal.Create(graphNegative.state)
  })

  test('TrafficGraph::calc', () => {
    const graph = TrafficGraph.Create()
    graph.to('a', {
      b: 1
    }).to('a', {
      b: '+=1'
    }).to('a', {
      b: '+=2',
      c: '-=1'
    })
    let traversal = TrafficTraversal.Create(graph.state)
    expect(traversal.traffic('a', 'b')).toBe(4)
    expect(traversal.traffic('a', 'c')).toBe(-1)
    expect(traversal.traffic('b', 'a')).toBe(Infinity)

    graph.both('a', {
      a: '+=1',
      b: '+=2',
      c: '+=3'
    })
    traversal = TrafficTraversal.Create(graph.state)
    expect(traversal.traffic('a', 'b')).toBe(6)
    expect(traversal.traffic('a', 'c')).toBe(2)
    expect(traversal.traffic('b', 'a')).toBe(2)
    expect(traversal.traffic('c', 'a')).toBe(3)

    graph.all({
      a: '*=1',
      b: '*=2',
      c: '*=3',
    })
    traversal = TrafficTraversal.Create(graph.state)
    expect(traversal.traffic('a', 'b')).toBe(6)
    expect(traversal.traffic('a', 'c')).toBe(6)
    expect(traversal.traffic('b', 'a')).toBe(2)
    expect(traversal.traffic('b', 'c')).toBe(0)
    expect(traversal.traffic('c', 'a')).toBe(2)
    expect(traversal.traffic('c', 'b')).toBe(0)
  })

  test('TrafficGraph.data', () => {
    expect(graph.data.vertex.a).toEqual({ b: 1, c: 2 })
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

  test('TrafficGraph.invert', () => {
    graphNegative.invert()
    traversalNegative = TrafficTraversal.Create(graphNegative.state)
    expect(traversalNegative.routes('1', '4')).toEqual(['1', '4'])

    graphNegative.invert()
    traversalNegative = TrafficTraversal.Create(graphNegative.state)
    expect(traversalNegative.routes('1', '4')).toEqual(['1', '7', '5', '4'])
  })

  test('TrafficTraversal.reachable', () => {
    expect(traversal.reachable('a', 'C')).toBe(false)
    expect(traversalNegative.reachable('1', '4')).toBe(true)
    expect(traversalNegative.reachable('4', '1')).toBe(false)
  })

  test('TrafficTraversal.routes', () => {
    expect(traversal.routes('a', 'd')).toEqual(['a', 'b', 'd'])
    expect(traversalNegative.routes('1', '4')).toEqual(['1', '7', '5', '4'])
    expect(() => {
      traversalNegative.routes('4', '1')
    }).toThrowError()
  })

  test('TrafficTraversal.traffic', () => {
    expect(traversal.traffic('a', 'a')).toBe(0)
    expect(traversal.traffic('a', 'd')).toBe(3)
    expect(traversal.traffic('0', '5')).toBe(20)

    expect(traversalNegative.traffic('1', '4')).toBe(-0.285)
    expect(traversalNegative.traffic('4', '1')).toBe(Infinity)
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

  test('TrafficTraversal.weight', () => {
    expect(traversal.weight('a', 'traffic')).toBe(0)
    expect(traversal.weight('a', 'number')).toBe(0)
    expect(traversal.weight('a', 'mean')).toBe(0)

    expect(traversalNegative.weight('1', 'traffic')).toBe(-0.305)
    expect(traversalNegative.weight('1', 'number')).toBe(4)
    expect(traversalNegative.weight('1', 'mean')).toBe(-0.07625)
  })
})

describe('Helpers', () => {
  let graph: TrafficGraph
  let encoder: VertexEncoder

  beforeEach(() => {
    graph = TrafficGraph.Create()
    
    graph.to('the', {
      fat: 1,
      cat: 2
    }).to('fat', {
      the: 1,
      cat: 1,
      sat: 2
    }).to('cat', {
      the: 2,
      fat: 1,
      sat: 1,
      on: 2
    }).to('sat', {
      fat: 2,
      cat: 1,
      on: 1,
      the: 2
    }).to('on', {
      fat: 2,
      cat: 1,
      the: 1,
      mat: 2
    }).to('the', {
      sat: '+=2',
      on: '+=1',
      mat: '+=1'
    }).to('mat', {
      on: 2,
      the: 1
    })

    encoder = VertexEncoder.Create(graph.state)
  })

  test('VertexEncoder.zeroHot', () => {
    expect(encoder.zeroHot()).toEqual([0, 0, 0, 0, 0, 0])
  })

  test('VertexEncoder.oneHot', () => {
    expect(encoder.oneHot()).toEqual({
      the:  [1, 0, 0, 0, 0, 0],
      fat:  [0, 1, 0, 0, 0, 0],
      cat:  [0, 0, 1, 0, 0, 0],
      sat:  [0, 0, 0, 1, 0, 0],
      on:   [0, 0, 0, 0, 1, 0],
      mat:  [0, 0, 0, 0, 0, 1],
    })
  })

  test('VertexEncoder.label', () => {
    expect(encoder.label()).toEqual({
      the:  0,
      fat:  1,
      cat:  2,
      sat:  3,
      on:   4,
      mat:  5,
    })

    expect(encoder.label(1)).toEqual({
      the:  1,
      fat:  2,
      cat:  3,
      sat:  4,
      on:   5,
      mat:  6,
    })
  })
})
