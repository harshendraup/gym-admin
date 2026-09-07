import { post } from './client'

/**
 * The marketing site's Contact page. Public — no auth token is attached
 * because none exists yet at this point in a visitor's journey; the backend
 * route is unauthenticated for the same reason (see gym-os-api's
 * ContactController).
 */
export interface ContactRequest {
  name: string
  email: string
  gym?: string
  phone?: string
  topic: string
  message: string
}

export const contactApi = {
  send: (payload: ContactRequest) => post<{ sent: boolean }>('/contact', payload),
}
