export function remove<T>(array: T[], ...items: T[]): void {
  let i = array.length
  while (i--) {
    if (items.includes(array[i])) {
      array.splice(i, 1)
    }
  }
}

export function add<T>(array: T[], ...items: T[]): void {
  array.push(...items)
}

export function ensure<T>(array: T[], ...items: T[]): void {
  for (const t of items) {
    if (array.includes(t)) {
      continue
    }
    array.push(t)
  }
}

export function has<T>(array: T[], ...items: T[]): boolean {
  for (const t of items) {
    if (!array.includes(t)) {
      return false
    }
  }
  return true
}

export function first<T>(array: T[]): T|undefined {
  return array.at(0)
}

export function last<T>(array: T[]): T|undefined {
  return array.at(-1)
}

export function copy<T>(array: T[]): T[] {
  return [...array]
}
