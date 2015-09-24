
export function keys(obj) {
  return Object.keys(obj)
}

export function values(obj) {
  return keys(obj).map(k => obj[k])
}

export function pairs(obj) {
  return keys(obj).map(k => [k, obj[k]])
}

export function sortBy(arr, comp) {
  return arr.slice().sort((a, b) => (
    comp(a) < comp(b) ? -1 : (comp(a) > comp(b) ? 1 : 0)
  ))
}

export function extend(dest, ...objs) {
  objs.forEach(obj => {
    const o = obj || {}
    keys(o).forEach(k => {
      if (o.hasOwnProperty(k)) {
        dest[k] = o[k]
      }
    })
  })
  return dest
}

export function find(arr, predicate) {
  const results = (arr || []).filter(predicate)
  return results.length ? results[0] : undefined
}

export function isPlainObj(o) {
  return typeof o == 'object' && o.constructor == Object;
}
