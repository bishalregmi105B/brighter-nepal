const PREFIX = 'bnenc:'
const DEFAULT_KEY = 'bn-url-cipher-v1'

function getKeyBytes(): Uint8Array {
  const key = (process.env.NEXT_PUBLIC_URL_CIPHER_KEY || DEFAULT_KEY).trim() || DEFAULT_KEY
  return new TextEncoder().encode(key)
}

function xorBytes(data: Uint8Array, key: Uint8Array): Uint8Array {
  const out = new Uint8Array(data.length)
  for (let i = 0; i < data.length; i += 1) {
    out[i] = data[i] ^ key[i % key.length]
  }
  return out
}

function decodeBase64(base64: string): string {
  const atobFn = (globalThis as { atob?: (value: string) => string }).atob
  if (typeof atobFn === 'function') {
    return atobFn(base64)
  }

  const BufferCtor = (globalThis as { Buffer?: { from: (value: string, encoding: string) => { toString: (enc: string) => string } } }).Buffer
  if (BufferCtor?.from) {
    return BufferCtor.from(base64, 'base64').toString('binary')
  }
  throw new Error('No base64 decoder available')
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
  const binary = decodeBase64(padded)
  const out = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i)
  }
  return out
}

export function decryptApiUrl(value?: string | null): string {
  const raw = (value || '').trim()
  if (!raw) return ''
  if (!raw.startsWith(PREFIX)) return raw

  try {
    const token = raw.slice(PREFIX.length)
    if (!token) return ''
    const encrypted = base64UrlToBytes(token)
    const key = getKeyBytes()
    const plainBytes = xorBytes(encrypted, key)
    return new TextDecoder().decode(plainBytes)
  } catch {
    return ''
  }
}
