export type GuideProtocol = 'openai' | 'anthropic'

export interface GuideEndpoints {
  openaiBaseUrl: string
  anthropicBaseUrl: string
  chatCompletionsUrl: string
  messagesUrl: string
}

/** Keep the deployment path while avoiding /v1/v1 in client configuration. */
export function getGuideEndpoints(configuredBase: string | undefined, origin: string): GuideEndpoints | null {
  const value = configuredBase?.trim() || origin
  try {
    const url = value.startsWith('/') && !value.startsWith('//')
      ? new URL(value, origin)
      : new URL(value)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

    // A public connection guide must never reproduce credentials or query tokens.
    url.username = ''
    url.password = ''
    url.search = ''
    url.hash = ''
    url.pathname = url.pathname.replace(/\/+$/, '').replace(/\/v1$/, '')
    const root = url.toString().replace(/\/+$/, '')
    return {
      openaiBaseUrl: `${root}/v1`,
      anthropicBaseUrl: root,
      chatCompletionsUrl: `${root}/v1/chat/completions`,
      messagesUrl: `${root}/v1/messages`,
    }
  } catch {
    return null
  }
}

function quoteForBash(value: string): string {
  return `'${value.replace(/'/g, `'"'"'`)}'`
}

/** These examples use placeholders only and never receive a user's API key. */
export function buildGuideCurl(endpoints: GuideEndpoints, protocol: GuideProtocol): string {
  const isAnthropic = protocol === 'anthropic'
  const endpoint = isAnthropic ? endpoints.messagesUrl : endpoints.chatCompletionsUrl
  const headers = isAnthropic
    ? ['x-api-key: YOUR_API_KEY', 'anthropic-version: 2023-06-01']
    : ['Authorization: Bearer YOUR_API_KEY']
  const body = JSON.stringify({
    model: 'YOUR_MODEL_ID',
    max_tokens: 128,
    messages: [{ role: 'user', content: 'Hello!' }],
  }, null, 2)
  return [
    `curl --request POST --url ${quoteForBash(endpoint)}`,
    `  --header 'Content-Type: application/json'`,
    ...headers.map(header => `  --header ${quoteForBash(header)}`),
    `  --data ${quoteForBash(body)}`,
  ].join(' \\\n')
}
