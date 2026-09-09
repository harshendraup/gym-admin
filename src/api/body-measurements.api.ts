import { get, post, put, del } from './client'

export interface BodyMeasurementRecord {
  id: number
  businessId: number
  branchId: number
  memberId: number
  recordedBy: number | null
  recordedDate: string
  weight: string | null
  height: string | null
  bmi: string | null
  bodyFatPercentage: string | null
  waist: string | null
  chest: string | null
  hips: string | null
  arms: string | null
  thigh: string | null
  calf: string | null
  photoUrls: string[] | null
  notes: string | null
  metaBodyMeasurement: unknown | null
  createdAt: string
  updatedAt: string
}

export interface CreateBodyMeasurementPayload {
  memberId: number
  recordedDate: string
  weight?: number
  height?: number
  bodyFatPercentage?: number
  waist?: number
  chest?: number
  hips?: number
  arms?: number
  thigh?: number
  calf?: number
  photoUrls?: string[]
  notes?: string
}

export type UpdateBodyMeasurementPayload = Partial<Omit<CreateBodyMeasurementPayload, 'memberId'>>

export const bodyMeasurementsApi = {
  list: () => get<BodyMeasurementRecord[]>('/body-measurements'),
  forMember: (memberId: number) => get<BodyMeasurementRecord[]>(`/body-measurements/member/${memberId}`),
  get: (id: number) => get<BodyMeasurementRecord>(`/body-measurements/${id}`),
  create: (data: CreateBodyMeasurementPayload) => post<BodyMeasurementRecord>('/body-measurements', data),
  update: (id: number, data: UpdateBodyMeasurementPayload) =>
    put<BodyMeasurementRecord>(`/body-measurements/${id}`, data),
  delete: (id: number) => del<void>(`/body-measurements/${id}`),
}
