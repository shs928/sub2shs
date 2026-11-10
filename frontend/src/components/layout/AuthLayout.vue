<template>
  <div class="auth-page">
    <header class="auth-navigation">
      <a class="auth-back-link" href="https://blessingshs.cc.cd/">
        <span aria-hidden="true">←</span>{{ t('blessingAuth.backToHub') }}
      </a>
      <div class="auth-navigation-links">
        <router-link v-if="!appStore.backendModeEnabled" to="/home">{{ t('blessingAuth.home') }}</router-link>
        <router-link v-if="!appStore.backendModeEnabled" to="/guide">{{ t('blessingAuth.guide') }}</router-link>
        <LocaleSwitcher />
      </div>
    </header>

    <main class="auth-main">
      <section class="auth-story" :aria-label="t('blessingAuth.aboutService')">
        <router-link v-if="settingsLoaded" to="/home" class="auth-brand">
          <img v-if="siteLogo" :src="siteLogo" :alt="siteName" class="auth-logo" />
          <span v-else class="auth-brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
          <span class="auth-brand-copy">
            <strong>{{ siteName }}</strong>
            <span>{{ t('blessingAuth.partOfHub') }}</span>
          </span>
        </router-link>
        <div v-else class="auth-brand-placeholder" aria-hidden="true"></div>

        <div class="auth-story-content">
          <p class="auth-eyebrow">A LITTLE HUB. MORE POSSIBILITIES.</p>
          <h1>{{ t('blessingAuth.titleLineOne') }}<br />{{ t('blessingAuth.titleLineTwo') }}<span>.</span></h1>
          <p class="auth-story-description">{{ siteSubtitle }}</p>
          <div class="auth-connection" aria-hidden="true">
            <div class="auth-connection-card">
              <span class="auth-connection-icon">↗</span>
              <span>{{ t('blessingAuth.yourIdeas') }}</span>
              <small>CREATE & BUILD</small>
            </div>
            <span class="auth-connection-line"><i></i><i></i><i></i></span>
            <div class="auth-connection-card auth-connection-card-end">
              <span class="auth-connection-icon">✳</span>
              <span>{{ t('blessingAuth.aiTools') }}</span>
              <small>CONNECT & EXPLORE</small>
            </div>
          </div>
        </div>
        <div class="auth-story-footer">
          <span class="auth-story-dot" aria-hidden="true"></span>
          <p>{{ t('blessingAuth.storyFooter') }}</p>
          <span aria-hidden="true">↗</span>
        </div>
      </section>

      <section class="auth-form-area" :aria-label="t('blessingAuth.accountAccess')">
        <div class="auth-form-card"><slot /></div>
        <div class="auth-form-footer"><slot name="footer" /></div>
        <router-link v-if="!appStore.backendModeEnabled" to="/guide" class="auth-help-link">
          {{ t('blessingAuth.firstVisit') }} <span aria-hidden="true">↗</span>
        </router-link>
      </section>
    </main>
    <footer class="auth-page-footer">
      <span>&copy; {{ currentYear }} {{ siteName }}</span>
      <span>{{ t('blessingAuth.footer') }}</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores'
import { sanitizeUrl } from '@/utils/url'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'

const { t } = useI18n()
const appStore = useAppStore()
const siteName = computed(() => appStore.siteName || 'Blessing API')
const siteLogo = computed(() => sanitizeUrl(appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const siteSubtitle = computed(() => appStore.cachedPublicSettings?.site_subtitle || t('blessingAuth.description'))
const settingsLoaded = computed(() => appStore.publicSettingsLoaded)
const currentYear = new Date().getFullYear()

onMounted(() => {
  appStore.fetchPublicSettings()
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  padding: 24px clamp(20px, 4vw, 64px) 18px;
  background: var(--hub-bg, #f7f7f3);
  color: var(--hub-text, #2c3029);
}
.auth-navigation, .auth-main, .auth-page-footer { width: 100%; max-width: 1200px; margin-inline: auto; }
.auth-navigation, .auth-navigation-links, .auth-back-link { display: flex; align-items: center; }
.auth-navigation { justify-content: space-between; gap: 20px; padding-bottom: 24px; font-size: 13px; color: var(--hub-muted, #86897f); }
.auth-navigation-links { gap: 22px; }
.auth-back-link { gap: 9px; }
.auth-back-link > span { font-size: 18px; }
.auth-navigation a { padding-block: 8px; }
.auth-navigation a:hover, .auth-help-link:hover { color: var(--hub-accent, #ed7545); }
.auth-main { flex: 1; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: clamp(32px, 5vw, 76px); align-items: center; }
.auth-story {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  min-height: 570px;
  padding: clamp(28px, 3.5vw, 48px);
  border: 1px solid var(--hub-border, #e8e9e1);
  border-radius: 24px;
  background: var(--hub-sage, #e9eee4);
}
.auth-brand { display: inline-flex; align-items: center; gap: 13px; align-self: flex-start; min-width: 0; max-width: 100%; }
.auth-logo, .auth-brand-mark { width: 40px; height: 40px; flex-shrink: 0; }
.auth-logo { object-fit: contain; border-radius: 10px; }
.auth-brand-mark { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; transform: rotate(-4deg); }
.auth-brand-mark i { background: var(--hub-accent, #ed7545); border-radius: 5px; }
.auth-brand-mark i:last-child { border-radius: 50%; background: var(--hub-text, #2c3029); }
.auth-brand-copy { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.auth-brand-copy strong { overflow-wrap: anywhere; font-size: 20px; letter-spacing: -0.6px; line-height: 1.25; }
.auth-brand-copy > span { font-size: 10px; letter-spacing: 0.03em; color: var(--hub-muted, #86897f); }
.auth-brand-placeholder { height: 44px; }
.auth-story-content { padding-block: 48px 34px; }
.auth-eyebrow { font-size: 9px; font-weight: 600; letter-spacing: 0.17em; color: var(--hub-muted, #86897f); line-height: 1.8; }
.auth-story h1 { margin-top: 22px; font-size: clamp(30px, 3.5vw, 46px); line-height: 1.4; font-weight: 650; letter-spacing: -0.04em; }
.auth-story h1 > span { color: var(--hub-accent, #ed7545); }
.auth-story-description { margin-top: 20px; max-width: 340px; font-size: 14px; line-height: 1.9; color: var(--hub-muted, #86897f); overflow-wrap: anywhere; white-space: pre-line; }
.auth-connection { display: flex; align-items: center; margin-top: 42px; padding: 6px 0; }
.auth-connection-card { display: flex; flex: 1; min-width: 0; flex-direction: column; align-items: center; gap: 9px; padding: 20px 8px 16px; border-radius: 15px; background: var(--hub-panel, #fff); border: 1px solid var(--hub-border, #e8e9e1); transform: rotate(-4deg); }
.auth-connection-card-end { transform: rotate(4deg); }
.auth-connection-icon { font-size: 28px; line-height: 1; color: var(--hub-accent, #ed7545); }
.auth-connection-card-end .auth-connection-icon { color: var(--hub-text, #2c3029); }
.auth-connection-card > span:not(.auth-connection-icon) { font-size: 12px; font-weight: 600; text-align: center; }
.auth-connection-card small { font-size: 7px; letter-spacing: 0.12em; color: var(--hub-muted, #86897f); text-align: center; }
.auth-connection-line { width: 42px; display: flex; justify-content: center; gap: 5px; flex-shrink: 0; }
.auth-connection-line i { width: 3px; height: 3px; border-radius: 50%; background: var(--hub-muted, #86897f); opacity: 0.6; }
.auth-story-footer { display: flex; align-items: center; gap: 9px; padding-top: 22px; border-top: 1px solid var(--hub-border, #e8e9e1); color: var(--hub-muted, #86897f); font-size: 11px; line-height: 1.7; }
.auth-story-footer p { flex: 1; }
.auth-story-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--hub-accent, #ed7545); flex-shrink: 0; }
.auth-form-area { width: 100%; max-width: 440px; justify-self: center; min-width: 0; padding-block: 32px; }
.auth-form-card { background: var(--hub-panel, #fff); border: 1px solid var(--hub-border, #e8e9e1); border-radius: 22px; padding: clamp(24px, 3vw, 36px); box-shadow: 0 6px 32px rgb(44 48 41 / 3%); }
.auth-form-footer { margin-top: 24px; text-align: center; font-size: 14px; }
.auth-help-link { display: block; margin-top: 22px; text-align: center; font-size: 12px; color: var(--hub-muted, #86897f); }
.auth-help-link span { margin-left: 5px; }
.auth-page-footer { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px 24px; padding-top: 24px; color: var(--hub-muted, #86897f); font-size: 10px; line-height: 1.6; }
@media (max-width: 899px) {
  .auth-page { padding-inline: 24px; }
  .auth-main { display: flex; flex-direction: column; justify-content: center; gap: 24px; }
  .auth-story { background: transparent; border: 0; border-radius: 0; padding: 12px 0 0; min-height: auto; align-self: center; max-width: 440px; }
  .auth-brand { align-self: center; }
  .auth-brand-copy strong { font-size: 24px; }
  .auth-brand-copy > span { font-size: 11px; }
  .auth-story-content, .auth-story-footer { display: none; }
  .auth-form-area { padding-block: 0 30px; }
  .auth-page-footer { justify-content: center; text-align: center; padding-top: 12px; }
}
@media (max-width: 420px) {
  .auth-page { padding: 14px 16px 18px; }
  .auth-navigation { gap: 10px; font-size: 12px; padding-bottom: 24px; }
  .auth-navigation-links { gap: 12px; }
  .auth-form-card { padding: 24px 20px; border-radius: 18px; }
}
</style>
