export function clamp(
  value: number,
  bounds: { min?: number; max?: number }
): number {
  let v = value;
  if (bounds.max !== undefined) {
    v = Math.min(bounds.max, v);
  }

  if (bounds.min !== undefined) {
    v = Math.max(bounds.min, v);
  }

  return v;
}

export function randomIntInRange(
  includedMin: number,
  excludedMax: number
): number {
  return Math.floor(Math.random() * (excludedMax - includedMin)) + includedMin;
}
