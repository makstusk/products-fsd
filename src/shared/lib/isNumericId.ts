export function isNumericId(value: string): boolean {
  if (!value) return false
  const n = Number(value)
  return Number.isInteger(n) && String(n) === value
}
