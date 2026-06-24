export function upscaleImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const LONG_SIDE = 1920
      const MIN_SIDE = 1080
      let { width, height } = img

      // Determine target size: upscale to at least MIN_SIDE, at most LONG_SIDE
      const longSide = Math.max(width, height)
      let targetLong: number
      if (longSide < MIN_SIDE) {
        targetLong = MIN_SIDE
      } else if (longSide > LONG_SIDE) {
        targetLong = LONG_SIDE
      } else {
        targetLong = longSide
      }

      const scale = targetLong / longSide
      width = Math.round(width * scale)
      height = Math.round(height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      resolve(canvas.toDataURL('image/jpeg', 0.92))
    }
    img.onerror = () => reject(new Error('Failed to decode image'))
    img.src = dataUrl
  })
}
