export function useHashmap<T>() {
  const _map = new Map<string, T>()

  const set = (key: string, data: T) => {
    _map.set(key, data)
    return data
  }
  const has = (key: string) => _map.has(key)
  const get = (key: string) => _map.get(key)
  const ensure = (key: string, callback: () => T) => {
    if (has(key)) {
      return get(key)!
    }
    return set(key, callback())
  }

  return {
    set,
    has,
    get,
    ensure
  }
}
