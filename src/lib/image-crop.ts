/**
 * Client-side crop / downscale for app-config uploads.
 *
 * The mobile app lays these images out at fixed aspect ratios, so a picture
 * that doesn't match gets stretched or letterboxed on the device. Fixing the
 * ratio here — before the file leaves the browser — is the only point where
 * a human can still see what's being cut off.
 *
 * Canvas only: no dependency, and the bytes that get uploaded are exactly
 * the bytes the preview shows.
 */

export type CropFit = 'cover' | 'contain'

export interface ImageSpec {
  /** width / height. `null` skips processing entirely (video). */
  ratio: number | null
  /** Longest edge of the output; larger sources are downscaled to it. */
  maxWidth: number
  /**
   * `cover` fills the frame and crops the overflow — right for photography.
   * `contain` fits the whole image inside and pads the rest, so a wide logo
   * isn't sliced in half to become square.
   */
  fit: CropFit
  /** Shown in the UI, e.g. "16:9 · 1600×900". */
  label: string
}

export interface RenderedCrop {
  blob: Blob
  dataUrl: string
  width: number
  height: number
  bytes: number
}

/** SVG is vector — rasterising it to fit a ratio would only lose quality. */
export function isVector(file: File) {
  return file.type === 'image/svg+xml'
}

/** Sources that may carry transparency must not be flattened onto white. */
function outputType(file: File, fit: CropFit) {
  const keepsAlpha = file.type === 'image/png' || file.type === 'image/webp'
  return keepsAlpha || fit === 'contain' ? 'image/png' : 'image/jpeg'
}

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('That file could not be read as an image'))
    }
    img.src = url
  })
}

/**
 * Renders the image at the spec's ratio.
 *
 * `offset` (0–1) picks which part survives a `cover` crop — 0 is top/left,
 * 1 is bottom/right — so a subject that isn't centred can still be kept.
 * It has no effect on `contain`, where nothing is cut.
 */
export async function renderCrop(
  file: File,
  img: HTMLImageElement,
  spec: ImageSpec,
  offset = 0.5
): Promise<RenderedCrop> {
  const ratio = spec.ratio!
  const sourceWidth = img.naturalWidth
  const sourceHeight = img.naturalHeight

  // Never render wider than the pixels actually available, or a tall photo
  // cropped to a wide banner would be blown up past its own resolution.
  //
  // The bound differs by fit: `cover` can only use the crop window it keeps,
  // while `contain` needs a frame large enough to hold the whole image at
  // 1:1 before `maxWidth` scales it down.
  const naturalWidth =
    spec.fit === 'contain'
      ? Math.max(sourceWidth, sourceHeight * ratio)
      : Math.min(sourceWidth, sourceHeight * ratio)

  const outWidth = Math.round(Math.min(spec.maxWidth, naturalWidth))
  const outHeight = Math.round(outWidth / ratio)

  const canvas = document.createElement('canvas')
  canvas.width = outWidth
  canvas.height = outHeight
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'

  if (spec.fit === 'contain') {
    // Whole image inside the frame; the padding stays transparent so a logo
    // keeps working on any background the app puts behind it.
    const scale = Math.min(outWidth / sourceWidth, outHeight / sourceHeight)
    const drawWidth = sourceWidth * scale
    const drawHeight = sourceHeight * scale
    ctx.drawImage(
      img,
      (outWidth - drawWidth) / 2,
      (outHeight - drawHeight) / 2,
      drawWidth,
      drawHeight
    )
  } else {
    const sourceRatio = sourceWidth / sourceHeight
    let cropWidth = sourceWidth
    let cropHeight = sourceHeight
    let sx = 0
    let sy = 0

    if (sourceRatio > ratio) {
      // Too wide: keep full height, slide the window horizontally.
      cropWidth = sourceHeight * ratio
      sx = (sourceWidth - cropWidth) * offset
    } else {
      // Too tall: keep full width, slide the window vertically.
      cropHeight = sourceWidth / ratio
      sy = (sourceHeight - cropHeight) * offset
    }

    ctx.drawImage(img, sx, sy, cropWidth, cropHeight, 0, 0, outWidth, outHeight)
  }

  const type = outputType(file, spec.fit)
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Could not encode the image'))),
      type,
      type === 'image/jpeg' ? 0.9 : undefined
    )
  })

  return {
    blob,
    dataUrl: canvas.toDataURL(type, 0.8),
    width: outWidth,
    height: outHeight,
    bytes: blob.size,
  }
}

/** Renames the processed blob so its extension matches what was encoded. */
export function toUploadFile(original: File, blob: Blob) {
  const extension = blob.type === 'image/png' ? 'png' : 'jpg'
  const base = original.name.replace(/\.[^.]+$/, '') || 'image'
  return new File([blob], `${base}.${extension}`, { type: blob.type })
}

/** True when the source already matches the target closely enough to leave alone. */
export function needsCrop(img: HTMLImageElement, ratio: number) {
  const sourceRatio = img.naturalWidth / img.naturalHeight
  return Math.abs(sourceRatio - ratio) > 0.01
}
