import { get, post, put, del } from './client'

export type AttendanceMethod = 'manual' | 'qr' | 'face'

export interface AttendanceLogRecord {
  id: number
  businessId: number
  branchId: number
  memberId: number
  recordedBy: number | null
  checkInAt: string
  checkOutAt: string | null
  method: AttendanceMethod
  notes: string | null
  metaAttendance: unknown | null
  createdAt: string
  updatedAt: string
}

export interface AttendanceStats {
  memberId: number
  totalVisits: number
  monthlyVisits: number
  lastCheckInAt: string | null
  streak: number
  avgVisitsPerWeek: number
}

export interface CreateAttendanceLogPayload {
  memberId: number
  checkInAt: string
  checkOutAt?: string
  method?: AttendanceMethod
  notes?: string
}

export type UpdateAttendanceLogPayload = Partial<Omit<CreateAttendanceLogPayload, 'memberId'>>

export const attendanceLogsApi = {
  list: () => get<AttendanceLogRecord[]>('/attendance-logs'),
  forMember: (memberId: number) => get<AttendanceLogRecord[]>(`/attendance-logs/member/${memberId}`),
  statsForMember: (memberId: number) => get<AttendanceStats>(`/attendance-logs/member/${memberId}/stats`),
  create: (data: CreateAttendanceLogPayload) => post<AttendanceLogRecord>('/attendance-logs', data),
  update: (id: number, data: UpdateAttendanceLogPayload) =>
    put<AttendanceLogRecord>(`/attendance-logs/${id}`, data),
  delete: (id: number) => del<void>(`/attendance-logs/${id}`),
}
