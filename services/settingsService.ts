import { api } from './api'

export interface GoogleFormsSettings {
  client_id: string
  client_secret: string
  refresh_token: string
  configured: boolean
}

export const settingsService = {
  getGoogleFormsSettings: () =>
    api.get<{ data: GoogleFormsSettings }>('/api/settings/google-forms'),
  updateGoogleFormsSettings: (payload: Partial<Pick<GoogleFormsSettings, 'client_id' | 'client_secret' | 'refresh_token'>>) =>
    api.patch<{ data: GoogleFormsSettings }>('/api/settings/google-forms', payload),
}
