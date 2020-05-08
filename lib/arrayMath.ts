export function cumsum(values: Array<number | null | undefined>) {
  let sum = 0
  return Array.from(values, v => (sum += v || 0))
}

export function maxIndex(values: Array<number | null | undefined>) {
  let max = -Infinity
  let maxIndex = -1
  let index = -1
  for (const value of values) {
    ++index
    if (value != null && max < value) {
      ;(max = value), (maxIndex = index)
    }
  }
  return maxIndex
}

export function elementSum(arrays: Array<number[] | null>) {
  const filtered = arrays.filter(a => a !== null) as number[][]
  return filtered.reduce((memo, arr) => arr!.map((el, i) => memo![i] + el, []))
}

export function extractDiff(array: number[]) {
  return array.map((num, i) => num - (array[i - 1] || 0))
}

export function last(array: number[]) {
  return array[array.length - 1]
}
