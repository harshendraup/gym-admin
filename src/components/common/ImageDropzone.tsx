import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageDropzoneProps {
  value?: string
  onChange: (url: string) => void
  onUpload: (file: File) => Promise<{ url: string }>
  disabled?: boolean
  /** Client-side size check in MB — the server enforces its own limit too. */
  maxSizeMb?: number
  accept?: string
}

const DEFAULT_ACCEPT = 'image/png,image/jpeg,image/webp,image/svg+xml'

/** Drag-and-drop (or click-to-browse) single-image uploader with inline preview. */
export function ImageDropzone({
  value,
  onChange,
  onUpload,
  disabled,
  maxSizeMb = 5,
  accept = DEFAULT_ACCEPT,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const acceptedTypes = accept.split(',')

  const handleFile = async (file: File) => {
    setError(null)

    if (!acceptedTypes.includes(file.type)) {
      setError('Unsupported file type. Use PNG, JPG, WEBP, or SVG.')
      return
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File is too large. Max ${maxSizeMb}MB.`)
      return
    }

    setIsUploading(true)
    try {
      const { url } = await onUpload(file)
      onChange(url)
    } catch {
      // The upload mutation's own error handler already surfaces a toast.
    } finally {
      setIsUploading(false)
    }
  }

  const busy = disabled || isUploading

  return (
    <div className="space-y-2">
      <div
        onClick={() => !busy && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!busy) setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          if (busy) return
          const file = e.dataTransfer.files[0]
          if (file) handleFile(file)
        }}
        className={cn(
          'relative flex items-center gap-4 rounded-xl px-4 py-3 cursor-pointer transition-all duration-150',
          busy && 'cursor-not-allowed opacity-60'
        )}
        style={{
          background: isDragging ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.6)',
          border: `1.5px dashed ${isDragging ? 'rgba(59,130,246,0.5)' : 'rgba(59,130,246,0.25)'}`,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />

        {value ? (
          <img src={value} alt="Preview" className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg flex-shrink-0"
            style={{ background: 'rgba(59,130,246,0.1)' }}
          >
            {isUploading
              ? <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#2563EB' }} />
              : <ImagePlus className="h-5 w-5" style={{ color: '#2563EB' }} />
            }
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900">
            {isUploading ? 'Uploading...' : value ? 'Logo uploaded' : 'Drop an image or click to browse'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
            PNG, JPG, WEBP or SVG · up to {maxSizeMb}MB
          </p>
        </div>

        {value && !isUploading && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange('') }}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors"
            style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626' }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {error && <p className="text-xs" style={{ color: '#DC2626' }}>{error}</p>}
    </div>
  )
}
