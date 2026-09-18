export function avatarCropRect(width: number, height: number, zoom: number, centerX: number, centerY: number) {
  const size = Math.min(width, height) / Math.max(1, zoom)
  const x = Math.max(0, Math.min(width - size, centerX - size / 2))
  const y = Math.max(0, Math.min(height - size, centerY - size / 2))
  return { x, y, size }
}
