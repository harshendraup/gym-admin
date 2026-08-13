import { post } from './client'

export interface UploadResult {
  url: string
}

export const uploadsApi = {
  businessLogo: (file: File) => {
    const form = new FormData()
    form.append('logo', file)
    return post<UploadResult>('/uploads/business-logo', form)
  },
}
