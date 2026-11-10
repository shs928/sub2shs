<template>
  <div class="guide-page">
    <header class="guide-header">
      <nav class="guide-shell guide-navigation" :aria-label="t('blessingGuide.title')">
        <router-link to="/" class="guide-brand">
          <img :src="siteLogo || '/logo.svg'" alt="" class="guide-brand-logo" />
          <span>{{ siteName }}</span>
        </router-link>
        <div class="guide-navigation-actions">
          <a class="guide-hub-link" href="https://blessingshs.cc.cd/">{{ t('blessingGuide.hub') }} <span aria-hidden="true">↗</span></a>
          <LocaleSwitcher />
          <button
            type="button"
            class="guide-theme-button"
            :aria-label="isDark ? t('home.switchToLight') : t('home.switchToDark')"
            @click="toggleTheme"
          ><Icon :name="isDark ? 'sun' : 'moon'" size="sm" /></button>
          <router-link :to="accountDestination" class="guide-button guide-button-primary">
            {{ authStore.isAuthenticated ? t('blessingGuide.dashboard') : t('blessingGuide.login') }}
          </router-link>
        </div>
      </nav>
    </header>

    <main class="guide-shell guide-main">
      <router-link to="/" class="guide-back"><span aria-hidden="true">←</span> {{ t('blessingGuide.home') }}</router-link>
      <section class="guide-introduction" aria-labelledby="guide-title">
        <p class="guide-eyebrow">{{ t('blessingGuide.eyebrow') }}</p>
        <h1 id="guide-title">{{ t('blessingGuide.headline') }}</h1>
        <p class="guide-description">{{ t('blessingGuide.description') }}</p>
      </section>

      <ol class="guide-steps" :aria-label="t('blessingGuide.stepsLabel')">
        <li class="guide-step">
          <span class="guide-step-number" aria-hidden="true">01</span>
          <h2>{{ t('blessingGuide.steps.account.title') }}</h2>
          <p>{{ t('blessingGuide.steps.account.description') }}</p>
          <router-link :to="accountDestination" class="guide-text-link">{{ t('blessingGuide.steps.account.action') }} <span aria-hidden="true">↗</span></router-link>
        </li>
        <li class="guide-step">
          <span class="guide-step-number" aria-hidden="true">02</span>
          <h2>{{ t('blessingGuide.steps.key.title') }}</h2>
          <p>{{ t('blessingGuide.steps.key.description') }}</p>
          <router-link :to="keysDestination" class="guide-text-link">{{ t('blessingGuide.steps.key.action') }} <span aria-hidden="true">↗</span></router-link>
        </li>
        <li class="guide-step">
          <span class="guide-step-number" aria-hidden="true">03</span>
          <h2>{{ t('blessingGuide.steps.connect.title') }}</h2>
          <p>{{ t('blessingGuide.steps.connect.description') }}</p>
          <a href="#connection" class="guide-text-link">{{ t('blessingGuide.steps.connect.action') }} <span aria-hidden="true">↓</span></a>
        </li>
      </ol>

      <section id="connection" class="guide-connection" aria-labelledby="connection-title">
        <div class="guide-section-heading">
          <div>
            <h2 id="connection-title">{{ t('blessingGuide.connectTitle') }}</h2>
            <p>{{ t('blessingGuide.connectDescription') }}</p>
          </div>
          <div class="guide-protocol-switch" role="group" :aria-label="t('blessingGuide.protocolLabel')">
            <button
              v-for="option in protocols"
              :key="option"
              type="button"
              :aria-pressed="protocol === option"
              :class="{ 'is-selected': protocol === option }"
              @click="protocol = option"
            >{{ t(`blessingGuide.${option}`) }}</button>
          </div>
        </div>

        <div v-if="endpoints" class="guide-connection-grid">
          <div class="guide-address-card">
            <span class="guide-field-label">{{ t('blessingGuide.baseLabel') }}</span>
            <code class="guide-base-url">{{ clientBaseUrl }}</code>
            <p class="guide-address-help">{{ t(protocol === 'openai' ? 'blessingGuide.openaiBaseHelp' : 'blessingGuide.anthropicBaseHelp') }}</p>
            <button type="button" class="guide-button guide-copy-base" @click="copyBaseUrl(clientBaseUrl)">
              <Icon :name="baseCopied ? 'check' : 'copy'" size="sm" />
              {{ t(baseCopied ? 'blessingGuide.copied' : 'blessingGuide.copyBase') }}
            </button>
            <div class="guide-endpoint">
              <span class="guide-field-label">{{ t('blessingGuide.endpointLabel') }}</span>
              <code>{{ requestUrl }}</code>
            </div>
          </div>
          <div class="guide-example-card">
            <div class="guide-example-heading">
              <span>{{ t('blessingGuide.bashLabel') }}</span>
              <button type="button" class="guide-copy-example" @click="copyExample(curlExample)">
                <Icon :name="exampleCopied ? 'check' : 'copy'" size="sm" />
                {{ t(exampleCopied ? 'blessingGuide.copied' : 'blessingGuide.copyExample') }}
              </button>
            </div>
            <pre tabindex="0" :aria-label="t('blessingGuide.bashLabel')"><code>{{ curlExample }}</code></pre>
            <p class="guide-example-help">{{ t('blessingGuide.exampleHelp') }}</p>
          </div>
        </div>
        <p v-else class="guide-unavailable" role="status">{{ t(settingsLoading ? 'blessingGuide.loadingSettings' : 'blessingGuide.settingsUnavailable') }}</p>
      </section>

      <aside class="guide-model-note" aria-labelledby="models-title">
        <div class="guide-model-icon" aria-hidden="true"><Icon name="grid" size="md" /></div>
        <div class="guide-model-copy">
          <h2 id="models-title">{{ t('blessingGuide.modelsTitle') }}</h2>
          <p>{{ t('blessingGuide.modelsDescription') }}</p>
        </div>
        <router-link v-if="showModelPlaza" to="/model-plaza" class="guide-text-link">{{ t('blessingGuide.modelsAction') }} <span aria-hidden="true">↗</span></router-link>
        <router-link v-else :to="keysDestination" class="guide-text-link">{{ t('blessingGuide.keysAction') }} <span aria-hidden="true">↗</span></router-link>
      </aside>
    </main>

    <footer class="guide-footer guide-shell">
      <span>{{ siteName }} <span aria-hidden="true">/</span> {{ t('blessingGuide.title') }}</span>
      <span>{{ t('blessingGuide.footer') }}</span>
      <a href="https://blessingshs.cc.cd/">{{ t('blessingGuide.hub') }} <span aria-hidden="true">↗</span></a>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'
import { useClipboard } from '@/composables/useClipboard'
import { useAppStore, useAuthStore } from '@/stores'
import { FeatureFlags, isFeatureFlagEnabled } from '@/utils/featureFlags'
import { buildGuideCurl, getGuideEndpoints, type GuideProtocol } from '@/utils/blessingGuide'
import { sanitizeUrl } from '@/utils/url'

const { t } = useI18n()
const appStore = useAppStore()
const authStore = useAuthStore()
const protocols: GuideProtocol[] = ['openai', 'anthropic']
const protocol = ref<GuideProtocol>('openai')
const settingsLoading = ref(!appStore.publicSettingsLoaded)
const { copied: baseCopied, copyToClipboard: copyBaseUrl } = useClipboard()
const { copied: exampleCopied, copyToClipboard: copyExample } = useClipboard()
const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'Blessing API')
const siteLogo = computed(() => sanitizeUrl(appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const accountDestination = computed(() => authStore.isAuthenticated
  ? (authStore.isAdmin ? '/admin/dashboard' : '/dashboard')
  : '/login')
const keysDestination = computed(() => authStore.isAuthenticated ? '/keys' : '/login?redirect=/keys')
const showModelPlaza = computed(() =>
  isFeatureFlagEnabled(FeatureFlags.modelPlaza) &&
  (authStore.isAuthenticated || appStore.cachedPublicSettings?.model_plaza_require_auth !== true),
)
const endpoints = computed(() => {
  if (!appStore.publicSettingsLoaded && !appStore.cachedPublicSettings) return null
  return getGuideEndpoints(
    appStore.cachedPublicSettings?.api_base_url || appStore.apiBaseUrl,
    window.location.origin,
  )
})
const clientBaseUrl = computed(() => {
  if (!endpoints.value) return ''
  return protocol.value === 'openai' ? endpoints.value.openaiBaseUrl : endpoints.value.anthropicBaseUrl
})
const requestUrl = computed(() => {
  if (!endpoints.value) return ''
  return protocol.value === 'openai' ? endpoints.value.chatCompletionsUrl : endpoints.value.messagesUrl
})
const curlExample = computed(() => endpoints.value ? buildGuideCurl(endpoints.value, protocol.value) : '')
const isDark = ref(document.documentElement.classList.contains('dark'))

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(async () => {
  if (appStore.publicSettingsLoaded) {
    settingsLoading.value = false
    return
  }
  try {
    await appStore.fetchPublicSettings()
  } finally {
    settingsLoading.value = false
  }
})
</script>

<style scoped>
.guide-page { min-height: 100vh; background: var(--hub-bg, #f8f6f2); color: var(--hub-text, #302f2b); }
.guide-shell { width: min(1160px, calc(100% - 64px)); margin-inline: auto; }
.guide-header { border-bottom: 1px solid var(--hub-border, #e6e1d8); }
.guide-navigation { display: flex; min-height: 98px; align-items: center; justify-content: space-between; gap: 24px; }
.guide-brand { display: inline-flex; min-width: 0; align-items: center; gap: 12px; font-size: 18px; font-weight: 700; }
.guide-brand > span:last-child { max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.guide-brand-logo { width: 42px; height: 42px; flex-shrink: 0; object-fit: contain; }
.guide-navigation-actions { display: flex; align-items: center; gap: 14px; }
.guide-hub-link, .guide-back { color: var(--hub-muted, #78746b); font-size: 13px; }
.guide-hub-link { white-space: nowrap; }
.guide-hub-link > span { margin-left: 5px; }
.guide-back { display: inline-flex; align-items: center; gap: 8px; }
.guide-theme-button { display: grid; width: 36px; height: 36px; place-content: center; border-radius: 10px; color: var(--hub-muted, #78746b); }
.guide-theme-button:hover { background: var(--hub-soft, #f0e9de); }
.guide-button { display: inline-flex; min-height: 42px; justify-content: center; align-items: center; gap: 8px; border: 1px solid var(--hub-border, #e6e1d8); border-radius: 12px; padding: 10px 16px; font-size: 13px; font-weight: 600; }
.guide-button-primary { border-color: var(--hub-accent, #be663d); background: var(--hub-accent, #be663d); color: var(--hub-on-accent, #fff); white-space: nowrap; }
.guide-button-primary:hover { filter: brightness(.94); }
.guide-main { padding-top: 32px; padding-bottom: 64px; }
.guide-introduction { max-width: 800px; padding: 44px 0 36px; }
.guide-eyebrow { margin-bottom: 16px; color: var(--hub-accent, #be663d); font-size: 12px; font-weight: 700; letter-spacing: .12em; }
.guide-introduction h1 { font-size: clamp(28px, 3.4vw, 43px); font-weight: 650; line-height: 1.35; letter-spacing: -.035em; text-wrap: balance; }
.guide-description { max-width: 640px; margin-top: 18px; color: var(--hub-muted, #78746b); font-size: 15px; line-height: 1.9; }
.guide-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; margin: 0; padding: 0; list-style: none; }
.guide-step { display: flex; flex-direction: column; align-items: flex-start; border: 1px solid var(--hub-border, #e6e1d8); border-radius: 20px; padding: 26px; background: var(--hub-panel, #fffdf9); }
.guide-step-number { margin-bottom: 24px; color: var(--hub-accent, #be663d); font-family: ui-monospace, monospace; font-size: 12px; }
.guide-step h2 { font-size: 17px; font-weight: 600; }
.guide-step p { flex: 1; margin-top: 12px; margin-bottom: 22px; color: var(--hub-muted, #78746b); font-size: 13px; line-height: 1.85; }
.guide-text-link { display: inline-flex; align-items: center; gap: 10px; color: var(--hub-accent, #be663d); font-size: 13px; font-weight: 600; }
.guide-text-link:hover, .guide-back:hover, .guide-hub-link:hover { text-decoration: underline; text-underline-offset: 4px; }
.guide-connection { margin-top: 54px; scroll-margin-top: 28px; }
.guide-section-heading { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; margin-bottom: 22px; }
.guide-section-heading h2 { font-size: 22px; font-weight: 600; letter-spacing: -.025em; }
.guide-section-heading p { margin-top: 9px; color: var(--hub-muted, #78746b); font-size: 13px; line-height: 1.8; }
.guide-protocol-switch { display: inline-flex; flex-shrink: 0; gap: 3px; padding: 4px; border: 1px solid var(--hub-border, #e6e1d8); border-radius: 12px; background: var(--hub-soft, #f0e9de); }
.guide-protocol-switch button { min-height: 36px; border: 1px solid transparent; border-radius: 8px; padding: 6px 12px; color: var(--hub-muted, #78746b); font-size: 12px; font-weight: 600; }
.guide-protocol-switch button.is-selected { border-color: var(--hub-border, #e6e1d8); background: var(--hub-panel, #fffdf9); color: var(--hub-text, #302f2b); }
.guide-connection-grid { display: grid; grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); gap: 20px; align-items: stretch; }
.guide-address-card, .guide-example-card { min-width: 0; overflow: hidden; border: 1px solid var(--hub-border, #e6e1d8); border-radius: 20px; background: var(--hub-panel, #fffdf9); }
.guide-address-card { padding: 28px; }
.guide-field-label { display: block; color: var(--hub-muted, #78746b); font-size: 11px; font-weight: 600; letter-spacing: .04em; }
.guide-base-url { display: block; margin-top: 16px; font-size: 16px; line-height: 1.8; overflow-wrap: anywhere; }
.guide-address-help { margin-top: 12px; color: var(--hub-muted, #78746b); font-size: 12px; line-height: 1.85; }
.guide-copy-base { margin-top: 22px; background: var(--hub-soft, #f0e9de); }
.guide-copy-base:hover { border-color: var(--hub-accent, #be663d); }
.guide-endpoint { margin-top: 28px; padding-top: 24px; border-top: 1px solid var(--hub-border, #e6e1d8); }
.guide-endpoint code { display: block; margin-top: 11px; color: var(--hub-muted, #78746b); font-size: 12px; line-height: 1.8; overflow-wrap: anywhere; }
.guide-example-heading { display: flex; min-height: 58px; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid var(--hub-border, #e6e1d8); padding: 12px 22px; font-size: 12px; }
.guide-example-heading > span { color: var(--hub-muted, #78746b); }
.guide-copy-example { display: inline-flex; min-height: 32px; align-items: center; gap: 6px; color: var(--hub-accent, #be663d); font-size: 12px; font-weight: 600; }
.guide-example-card pre { max-width: 100%; overflow-x: auto; margin: 0; padding: 22px; color: var(--hub-text, #302f2b); font-size: 12px; line-height: 1.85; tab-size: 2; }
.guide-example-help { border-top: 1px solid var(--hub-border, #e6e1d8); padding: 16px 22px; background: var(--hub-soft, #f0e9de); color: var(--hub-muted, #78746b); font-size: 11px; line-height: 1.8; }
.guide-unavailable { border: 1px solid var(--hub-border, #e6e1d8); border-radius: 16px; padding: 24px; color: var(--hub-muted, #78746b); line-height: 1.8; }
.guide-model-note { display: flex; align-items: center; gap: 20px; margin-top: 26px; border: 1px solid var(--hub-border, #e6e1d8); border-radius: 18px; padding: 24px; }
.guide-model-icon { display: grid; width: 42px; height: 42px; flex-shrink: 0; place-content: center; border-radius: 13px; background: var(--hub-sage, #e8ecdf); color: var(--hub-sage-ink, #68755e); }
.guide-model-copy { flex: 1; }
.guide-model-copy h2 { font-size: 14px; font-weight: 600; }
.guide-model-copy p { max-width: 730px; margin-top: 7px; color: var(--hub-muted, #78746b); font-size: 12px; line-height: 1.85; }
.guide-model-note > .guide-text-link { flex-shrink: 0; }
.guide-footer { display: flex; justify-content: space-between; gap: 20px; border-top: 1px solid var(--hub-border, #e6e1d8); padding-block: 26px; color: var(--hub-muted, #78746b); font-size: 11px; line-height: 1.8; }
.guide-footer > span:first-child > span { margin-inline: 8px; color: var(--hub-border, #e6e1d8); }
.guide-page :is(a, button, pre):focus-visible { outline: 2px solid var(--hub-accent, #be663d); outline-offset: 4px; }
@media (max-width: 960px) {
  .guide-navigation-actions { gap: 8px; }
  .guide-hub-link { display: none; }
  .guide-brand > span:last-child { max-width: 180px; }
  .guide-section-heading { align-items: flex-start; flex-direction: column; gap: 18px; }
  .guide-step { padding: 22px; }
  .guide-connection-grid { grid-template-columns: minmax(0, 1fr); }
  .guide-address-card { padding: 24px; }
  .guide-model-note { flex-wrap: wrap; }
  .guide-model-note > .guide-text-link { margin-left: 62px; }
}
@media (max-width: 640px) {
  .guide-shell { width: calc(100% - 36px); }
  .guide-navigation { min-height: 84px; flex-wrap: wrap; gap: 14px; padding-block: 18px; }
  .guide-brand { gap: 9px; font-size: 16px; }
  .guide-brand-logo { width: 34px; height: 34px; }
  .guide-brand > span:last-child { max-width: 180px; }
  .guide-navigation-actions { flex: 1; justify-content: flex-end; }
  .guide-navigation-actions > .guide-button { min-height: 36px; padding: 7px 12px; font-size: 12px; }
  .guide-introduction { padding: 32px 0 28px; }
  .guide-description { font-size: 14px; }
  .guide-steps { grid-template-columns: minmax(0, 1fr); gap: 12px; }
  .guide-step { padding: 22px; }
  .guide-step-number { margin-bottom: 15px; }
  .guide-step p { margin-bottom: 16px; }
  .guide-connection { margin-top: 38px; }
  .guide-section-heading h2 { font-size: 20px; }
  .guide-base-url { font-size: 14px; }
  .guide-model-note { gap: 14px; padding: 20px; }
  .guide-model-icon { width: 34px; height: 34px; }
  .guide-model-copy { flex-basis: calc(100% - 48px); }
  .guide-model-note > .guide-text-link { margin-left: 48px; }
  .guide-footer { flex-direction: column; gap: 8px; }
}
</style>
