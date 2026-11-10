import { describe, expect, it } from 'vitest'
import { buildGuideCurl, getGuideEndpoints } from '../blessingGuide'

describe('connection guide endpoints', () => {
  it.each(['https://api.example.com', 'https://api.example.com/', 'https://api.example.com/v1', 'https://api.example.com/v1/'])('normalizes %s for both client conventions', (base) => {
    const endpoints = getGuideEndpoints(base, 'https://panel.example.com')
    expect(endpoints).toEqual({
      openaiBaseUrl: 'https://api.example.com/v1',
      anthropicBaseUrl: 'https://api.example.com',
      chatCompletionsUrl: 'https://api.example.com/v1/chat/completions',
      messagesUrl: 'https://api.example.com/v1/messages',
    })
  })

  it('preserves routed deployment paths and handles an unset public base', () => {
    expect(getGuideEndpoints(' /proxy/v1/ ', 'https://panel.example.com')?.messagesUrl)
      .toBe('https://panel.example.com/proxy/v1/messages')
    expect(getGuideEndpoints('  ', 'https://panel.example.com')?.openaiBaseUrl)
      .toBe('https://panel.example.com/v1')
  })

  it('does not expose embedded credentials, queries or fragments', () => {
    expect(getGuideEndpoints('https://user:secret@api.example.com/v1?key=secret#token', 'https://panel.example.com')?.openaiBaseUrl)
      .toBe('https://api.example.com/v1')
  })

  it.each(['javascript:alert(1)', '//api.example.com/v1', 'not a URL'])('rejects invalid configured addresses instead of pointing to another service: %s', (base) => {
    expect(getGuideEndpoints(base, 'https://panel.example.com')).toBeNull()
  })
})

describe('connection guide curl examples', () => {
  const endpoints = getGuideEndpoints('https://api.example.com/v1', 'https://panel.example.com')!

  it('uses Bearer authentication and a chat-completions request for OpenAI', () => {
    const curl = buildGuideCurl(endpoints, 'openai')
    expect(curl).toContain("--url 'https://api.example.com/v1/chat/completions'")
    expect(curl).toContain("--header 'Authorization: Bearer YOUR_API_KEY'")
    expect(curl).toContain('"model": "YOUR_MODEL_ID"')
    expect(curl).not.toContain('anthropic-version')
  })

  it('uses the required Anthropic headers and token limit for messages', () => {
    const curl = buildGuideCurl(endpoints, 'anthropic')
    expect(curl).toContain("--url 'https://api.example.com/v1/messages'")
    expect(curl).toContain("--header 'x-api-key: YOUR_API_KEY'")
    expect(curl).toContain("--header 'anthropic-version: 2023-06-01'")
    expect(curl).toContain('"max_tokens": 128')
    expect(curl).not.toContain('Authorization: Bearer')
  })

  it('quotes configured URL path apostrophes safely for Bash', () => {
    const routed = getGuideEndpoints("https://api.example.com/team's/v1", 'https://panel.example.com')!
    expect(buildGuideCurl(routed, 'openai')).toContain("team'\"'\"'s/v1/chat/completions")
  })
})
