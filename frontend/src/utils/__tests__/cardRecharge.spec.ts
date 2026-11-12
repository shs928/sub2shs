import { describe, expect, it } from 'vitest'
import { getCardPurchaseUrl, parseCardShopUrl } from '../cardRecharge'

describe('card shop link validation', () => {
  it('accepts public shop and product links', () => {
    expect(parseCardShopUrl(' https://wzyp.cn/shop/blessing ')).toBe('https://wzyp.cn/shop/blessing')
    expect(parseCardShopUrl('https://wzyp.cn/item/card-5')).toBe('https://wzyp.cn/item/card-5')
    expect(parseCardShopUrl('https://wzyp.cn/shop/M5WZ72DP/p8rlue')).toBe('https://wzyp.cn/shop/M5WZ72DP/p8rlue')
  })

  it.each([
    'https://wzyp.cn/merchant/dashboard/workplace',
    'https://wzyp.cn/merchant/login',
    'http://wzyp.cn/shop/blessing',
    'https://wzyp.cn.evil.example/shop/blessing',
    'https://user:secret@wzyp.cn/shop/blessing',
    'https://wzyp.cn:8443/shop/blessing',
    'javascript:alert(1)',
    '/shop/blessing',
    '',
  ])('rejects unsafe or non-public destination %s', value => {
    expect(parseCardShopUrl(value)).toBe('')
  })

  it('keeps the purchase entrance hidden until explicitly enabled with a valid URL', () => {
    expect(getCardPurchaseUrl(null)).toBe('')
    expect(getCardPurchaseUrl({ purchase_subscription_url: 'https://wzyp.cn/shop/blessing' })).toBe('')
    expect(getCardPurchaseUrl({ purchase_subscription_enabled: false, purchase_subscription_url: 'https://wzyp.cn/shop/blessing' })).toBe('')
    expect(getCardPurchaseUrl({ purchase_subscription_enabled: true, purchase_subscription_url: 'https://wzyp.cn/merchant/dashboard/workplace' })).toBe('')
    expect(getCardPurchaseUrl({ purchase_subscription_enabled: true, purchase_subscription_url: 'https://wzyp.cn/shop/blessing' })).toBe('https://wzyp.cn/shop/blessing')
  })
})
