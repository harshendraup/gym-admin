import { useMutation } from '@tanstack/react-query'
import { uploadsApi } from '@/api/uploads.api'
import { getApiErrorMessage } from '@/lib/api-error'
import { toast } from 'sonner'

export function useUploadBusinessLogo() {
  return useMutation({
    mutationFn: (file: File) => uploadsApi.businessLogo(file),
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to upload logo'))
    },
  })
}
