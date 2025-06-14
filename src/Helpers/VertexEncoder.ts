import type { ITrafficGraphState } from '../TrafficGraph'

import { copy } from '../Utils/Array'
import { useHashmap } from '../Utils/Hashmap'
import { deepCopy } from '../Utils/Object'


export class VertexEncoder {
  private readonly _trafficGraph: ITrafficGraphState
  private readonly _cNumbers: ReturnType<typeof useHashmap<number[]>>
  private readonly _cRecordNumber: ReturnType<typeof useHashmap<Record<string, number>>>
  private readonly _cRecordNumbers: ReturnType<typeof useHashmap<Record<string, number[]>>>

  static Create(...args: ConstructorParameters<typeof VertexEncoder>): VertexEncoder {
    return new VertexEncoder(...args)
  }

  /**
   * Create an instance to get the encoder utility functions from the graph. It takes a `graph.state` instance as a parameter.
   * @param trafficGraphState 
   */
  constructor(trafficGraphState: ITrafficGraphState) {
    this._trafficGraph = trafficGraphState
    this._cNumbers = useHashmap()
    this._cRecordNumber = useHashmap()
    this._cRecordNumbers = useHashmap()
  }

  /**
   * Exports a zero vector with all elements zero. The length of the vector is equal to the number of vertices in use in the graph.
   * This is good for use with the `oneHot` method.
   */
  zeroHot(): number[] {
    const raw = this._cNumbers.ensure('zeroHot', () => {
      return new Array(this._trafficGraph.vertices.length).fill(0)
    })
    return copy(raw)
  }

  /**
   * Convert each vertex to a one-hot vector and export it. The length of each vector is equal to the number of all vertices used in the graph.
   */
  oneHot(): Record<string, number[]> {
    const raw = this._cRecordNumbers.ensure('oneHot', () => {
      const encoding: Record<string, number[]> = {}
      const vertices = this._trafficGraph.vertices
      const len = vertices.length
  
      for (const v of vertices) {
        const i = this._trafficGraph.data.embedded.indexOf(v)
        if (i === -1) {
          throw new Error(`The '${v}' vertex exists in the 'state.vertices' array, but not in the 'state.data.embedded' array.`)
        }
        encoding[v] = new Array(len).fill(0)
        encoding[v][i] = 1
      }
      
      return encoding
    })

    const clone = deepCopy(raw)
    return clone
  }
  
  /**
   * Convert each vertex to a label integer and export it.
   * @param startFrom The starting value of the label integer. The default is `0`.
   */
  label(startFrom = 0): Record<string, number> {
    const raw = this._cRecordNumber.ensure(`label start from '${startFrom}'`, () => {
      const encoding: Record<string, number> = {}
      const vertices = this._trafficGraph.vertices
      
      for (const v of vertices) {
        const i = this._trafficGraph.data.embedded.indexOf(v)
        if (i === -1) {
          throw new Error(`The '${v}' vertex exists in the 'state.vertices' array, but not in the 'state.data.embedded' array.`)
        }
        encoding[v] = startFrom+i
      }
  
      return encoding
    })

    const clone = deepCopy(raw)
    return clone
  }
}
