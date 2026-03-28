import { api } from './api'

export interface GoogleFormsSettings {
  client_id: string
  client_secret: string
  refresh_token: string
  configured: boolean
}

export interface ChatSettings {
  chat_rate_limit_count: number
  chat_rate_limit_window_secs: number
}

export const settingsService = {
  getGoogleFormsSettings: () =>
    api.get<{ data: GoogleFormsSettings }>('/api/settings/google-forms'),
  updateGoogleFormsSettings: (payload: Partial<Pick<GoogleFormsSettings, 'client_id' | 'client_secret' | 'refresh_token'>>) =>
    api.patch<{ data: GoogleFormsSettings }>('/api/settings/google-forms', payload),
  getGoogleFormsOAuthUrl: () =>
    api.get<{ data: { auth_url: string; redirect_uri: string } }>('/api/settings/google-forms/oauth/url'),

  getChatSettings: () =>
    api.get<{ data: ChatSettings }>('/api/settings/chat'),
  updateChatSettings: (payload: Partial<ChatSettings>) =>
    api.patch<{ data: ChatSettings }>('/api/settings/chat', payload),
}
