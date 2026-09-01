// Shared client-side upload checks, used by the application and renewal forms.

export const MAX_FILE_BYTES = 5 * 1024 * 1024
export const ACCEPTED_EXT = /\.(pdf|jpe?g|png)$/i

// Below this variance-of-Laplacian score an image reads as soft/blurry. It's a
// heuristic used only to gently warn — never to block an upload.
export const BLUR_THRESHOLD = 90

// Returns an error message if the file is the wrong type or too large, else null.
export function validateFile(file) {
  if (!ACCEPTED_EXT.test(file.name)) return 'Only PDF, JPG, or PNG files are allowed.'
  if (file.size > MAX_FILE_BYTES) return 'That file is larger than 5MB.'
  return null
}

// Estimate image sharpness in-browser (variance of the Laplacian on a
// downscaled grayscale copy). Higher = sharper. Resolves null on any failure
// so a measurement problem never affects the upload. Images only.
export function measureSharpness(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      try {
        const W = 256
        const H = Math.max(1, Math.round((img.height / img.width) * W))
        const canvas = document.createElement('canvas')
        canvas.width = W
        canvas.height = H
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, W, H)
        const { data } = ctx.getImageData(0, 0, W, H)
        const gray = new Float32Array(W * H)
        for (let i = 0; i < W * H; i++) {
          gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]
        }
        let sum = 0
        let sumSq = 0
        let n = 0
        for (let y = 1; y < H - 1; y++) {
          for (let x = 1; x < W - 1; x++) {
            const i = y * W + x
            const lap = 4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - W] - gray[i + W]
            sum += lap
            sumSq += lap * lap
            n++
          }
        }
        const mean = sum / n
        resolve(sumSq / n - mean * mean)
      } catch {
        resolve(null)
      } finally {
        URL.revokeObjectURL(url)
      }
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}

// True when an image file is likely blurry (images only; non-images pass).
export async function isBlurry(file) {
  if (!/\.(jpe?g|png)$/i.test(file.name)) return false
  const sharpness = await measureSharpness(file)
  return sharpness != null && sharpness < BLUR_THRESHOLD
}
