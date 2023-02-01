type ObjectMap = {
  [key: string]: any
}

function ObjectMap() {}
ObjectMap.prototype = Object.create(null)

export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export function copy<T>(obj: T): T {
  return { ...obj }
}

export function hasOwnProperty(obj: object, property: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, property)
}

export function setObjectMap<T = {}>(t: T): T {
  (t as any).__proto__ = Object.create(null)
  return t
}
