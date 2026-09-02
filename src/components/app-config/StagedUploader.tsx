import { useRef, useState } from 'react'
import { Film, ImageOff, Loader2, Play, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  isVector,
  loadImage,
  needsCrop,
  renderCrop,
  toUploadFile,
  type ImageSpec,
} from '@/lib/image-crop'

export interface StagedItem {
  /** Local only — staged items have no server id until they're saved. */
  key: string
  original: File
  /** Null for video and SVG, which are uploaded byte-for-byte. */
  image: HTMLImageElement | null
  /** Which part of a `cover` crop survives, 0–1. */
  offset: number
  previewUrl: string
  /** What will actually be uploaded, after cropping. */
  uploadFile: File
  width: number | null
  height: number | null
  /** Illustrations only — which empty-state screen this fills. */
  slot?: string
}

/**
 * Files picked for upload but not yet sent.
 *
 * Uploading on selection meant a mistake was already in S3 and in the app
 * before anyone had seen it rendered. Staging keeps the picture local until
 * Save, so it can be re-framed or dropped for free.
 */
export function useStagedUploads(spec: ImageSpec) {
  const [items, setItems] = useState<StagedItem[]>([])
  const [isPreparing, setIsPreparing] = useState(false)

  const add = async (files: File[], slot?: string) => {
    setIsPreparing(true)
    try {
      for (const file of files) {
        const key = `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`

        // Video and SVG go up untouched: one can't be re-encoded in the
        // browser, the other is vector and would only lose by rasterising.
        // Both still get an object URL — a video with no preview URL is why
        // the demo-video rows showed a placeholder glyph and never a frame.
        if (spec.ratio === null || isVector(file)) {
          setItems((prev) => [
            ...prev,
            {
              key,
              original: file,
              image: null,
              offset: 0.5,
              previewUrl: URL.createObjectURL(file),
              uploadFile: file,
              width: null,
              height: null,
              slot,
            },
          ])
          continue
        }

        const image = await loadImage(file)
        const rendered = await renderCrop(file, image, spec, 0.5)
        setItems((prev) => [
          ...prev,
          {
            key,
            original: file,
            image,
            offset: 0.5,
            previewUrl: rendered.dataUrl,
            uploadFile: toUploadFile(file, rendered.blob),
            width: rendered.width,
            height: rendered.height,
            slot,
          },
        ])
      }
    } catch (error: any) {
      toast.error(error?.message ?? 'That file could not be prepared')
    } finally {
      setIsPreparing(false)
    }
  }

  /** Re-renders one item at a new crop position. */
  const reframe = async (key: string, offset: number) => {
    const item = items.find((entry) => entry.key === key)
    if (!item?.image) return

    const rendered = await renderCrop(item.original, item.image, spec, offset)
    setItems((prev) =>
      prev.map((entry) =>
        entry.key === key
          ? {
              ...entry,
              offset,
              previewUrl: rendered.dataUrl,
              uploadFile: toUploadFile(entry.original, rendered.blob),
            }
          : entry
      )
    )
  }

  // Only blob: URLs hold memory; a canvas data: URL is just a string.
  const release = (entry: StagedItem) => {
    if (entry.previewUrl.startsWith('blob:')) URL.revokeObjectURL(entry.previewUrl)
  }

  const remove = (key: string) =>
    setItems((prev) =>
      prev.filter((entry) => {
        if (entry.key !== key) return true
        release(entry)
        return false
      })
    )

  const clear = () =>
    setItems((prev) => {
      prev.forEach(release)
      return []
    })

  return { items, add, reframe, remove, clear, isPreparing }
}

export function StagedList({
  items,
  spec,
  isVideo,
  onReframe,
  onRemove,
  slotLabels,
}: {
  items: StagedItem[]
  spec: ImageSpec
  isVideo?: boolean
  onReframe: (key: string, offset: number) => void
  onRemove: (key: string) => void
  slotLabels?: Record<string, string>
}) {
  if (items.length === 0) return null

  return (
    <div
      className="space-y-2 rounded-xl p-3"
      style={{ background: 'rgba(217,119,6,0.06)', border: '1px dashed rgba(217,119,6,0.35)' }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#B45309' }}>
        {items.length} waiting to be saved
      </p>

      {items.map((item) => {
        const canReframe =
          item.image !== null && spec.fit === 'cover' && needsCrop(item.image, spec.ratio!)

        return (
          <div
            key={item.key}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5"
            style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(217,119,6,0.2)' }}
          >
            {isVideo ? (
              <VideoThumb url={item.previewUrl} className="h-14 w-24" />
            ) : (
              <img
                src={item.previewUrl}
                alt=""
                className="h-14 w-24 flex-shrink-0 rounded-lg object-contain"
                style={{ background: 'rgba(148,163,184,0.15)' }}
              />
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">
                {item.slot && slotLabels ? `${slotLabels[item.slot]} — ` : ''}
                {item.original.name}
              </p>
              <p className="text-xs text-slate-500">
                {item.width
                  ? `Cropped to ${item.width}×${item.height} · ${(item.uploadFile.size / 1024 / 1024).toFixed(2)}MB`
                  : `${(item.uploadFile.size / 1024 / 1024).toFixed(2)}MB · uploaded as-is`}
              </p>

              {canReframe && (
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Framing</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.02}
                    value={item.offset}
                    onChange={(e) => onReframe(item.key, Number(e.target.value))}
                    className="h-1 w-40 cursor-pointer"
                  />
                </div>
              )}
            </div>

            <Button
              size="icon"
              variant="ghost"
              className="text-red-600 hover:bg-red-50"
              title="Remove from this batch"
              onClick={() => onRemove(item.key)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}

/**
 * First frame of a video, with click-to-play.
 *
 * `#t=0.1` is what actually makes a frame appear: with `preload="metadata"`
 * alone most browsers paint an empty black box until something seeks, so a
 * demo clip looked indistinguishable from a broken one. Falls back to the
 * film glyph only when the file genuinely can't be decoded.
 */
export function VideoThumb({ url, className = 'h-12 w-20' }: { url: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  if (failed) {
    return (
      <div
        className={`flex flex-shrink-0 items-center justify-center rounded-lg bg-slate-900/85 ${className}`}
        title="This video could not be loaded — it may not be publicly readable"
      >
        <Film className="h-5 w-5 text-white" />
      </div>
    )
  }

  return (
    <button
      type="button"
      title={isPlaying ? 'Pause' : 'Play this clip'}
      onClick={() => {
        const video = videoRef.current
        if (!video) return
        if (video.paused) void video.play()
        else video.pause()
      }}
      className={`group relative flex-shrink-0 overflow-hidden rounded-lg bg-slate-900/85 ${className}`}
    >
      <video
        ref={videoRef}
        // Muted and inline, or a browser refuses to start playback at all
        // without a full user-gesture chain.
        muted
        playsInline
        preload="metadata"
        src={`${url}#t=0.1`}
        onError={() => setFailed(true)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        className="h-full w-full object-cover"
      />
      {!isPlaying && (
        <span className="absolute inset-0 flex items-center justify-center bg-slate-900/35 transition-colors group-hover:bg-slate-900/20">
          <Play className="h-4 w-4 text-white" fill="currentColor" />
        </span>
      )}
    </button>
  )
}

/** Thumbnail that says so when the stored file can't be fetched. */
export function AssetThumb({
  url,
  isVideo,
  className = 'h-12 w-20',
}: {
  url: string
  isVideo?: boolean
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  if (isVideo) return <VideoThumb url={url} className={className} />

  // A broken-image glyph gives no clue that the file is unreachable rather
  // than missing, and these 403 on any bucket prefix that isn't public.
  if (failed) {
    return (
      <div
        className={`flex flex-shrink-0 flex-col items-center justify-center rounded-lg ${className}`}
        style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}
        title="The stored file could not be loaded — it may not be publicly readable"
      >
        <ImageOff className="h-4 w-4" style={{ color: '#DC2626' }} />
      </div>
    )
  }

  return (
    <img
      src={url}
      alt=""
      onError={() => setFailed(true)}
      className={`flex-shrink-0 rounded-lg object-cover ${className}`}
      style={{ background: 'rgba(148,163,184,0.15)' }}
    />
  )
}

/** File picker button that hands raw files to the staging area. */
export function PickButton({
  accept,
  multiple,
  disabled,
  isPreparing,
  onPick,
  label = 'Add images',
}: {
  accept: string
  multiple?: boolean
  disabled?: boolean
  isPreparing?: boolean
  onPick: (files: File[]) => void
  label?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          if (files.length) onPick(files)
          e.target.value = ''
        }}
      />
      <Button size="sm" onClick={() => inputRef.current?.click()} disabled={disabled || isPreparing}>
        {isPreparing ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Upload className="mr-1.5 h-3.5 w-3.5" />
        )}
        {label}
      </Button>
    </>
  )
}
