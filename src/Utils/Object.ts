export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export function copy<T>(obj: T): T {
  return { ...obj }
}

export function hasOwnProperty(obj: object, property: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, property)
}
