export const CARD_DENOMINATIONS = [1, 5, 10, 20, 50] as const

/** Accept public card shop links, never a merchant dashboard or a credential URL. */
export function parseCardShopUrl(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return ''
  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'https:' || url.hostname !== 'wzyp.cn' || url.port || url.username || url.password) return ''
    if (!/^\/(?:shop\/[^/]+(?:\/[^/]+)?|item\/[^/]+)\/?$/.test(url.pathname)) return ''
    url.hash = ''
    return url.toString()
  } catch {
    return ''
  }
}

/** Reuse settings supported by the deployed backend without enabling native payments. */
export function getCardPurchaseUrl(settings: unknown): string {
  if (!settings || typeof settings !== 'object') return ''
  if (!('purchase_subscription_enabled' in settings) || settings.purchase_subscription_enabled !== true) return ''
  if (!('purchase_subscription_url' in settings)) return ''
  return parseCardShopUrl(settings.purchase_subscription_url)
}
