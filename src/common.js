
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
