<template>
  <!-- The administrator's custom landing page takes precedence over both built-in modes. -->
  <div v-if="hasHomeContent" class="min-h-screen">
    <iframe
      v-if="isHomeContentUrl"
      :src="homeContent.trim()"
      :title="siteName"
      class="h-screen w-full border-0"
      allowfullscreen
    ></iframe>
    <div v-else v-html="homeContent"></div>
  </div>

  <div
    v-else
    class="blessing-home"
    :data-testid="compactHomeEnabled ? 'compact-home' : 'blessing-home'"
  >
    <header class="home-header">
      <div class="home-shell header-inner">
        <a class="brand" href="https://blessingshs.cc.cd/" :aria-label="t('blessingHome.backToHub')">
          <img :src="siteLogo || '/logo.svg'" :alt="siteName" class="brand-logo" />
          <span class="brand-copy">
            <strong>{{ siteName }}</strong>
            <span>BY BLESSING HUB</span>
          </span>
        </a>
        <nav class="header-actions" :aria-label="t('blessingHome.navigation')">
          <router-link v-if="showModelPlazaEntry" to="/model-plaza" class="nav-link optional-nav">
            {{ t('nav.modelPlaza') }}
          </router-link>
          <router-link to="/guide" class="nav-link optional-nav">{{ t('blessingHome.guide') }}</router-link>
          <router-link v-if="cardPurchaseUrl" to="/redeem" class="nav-link">{{ t('blessingRecharge.nav') }}</router-link>
          <a v-if="docUrl" :href="docUrl" target="_blank" rel="noopener noreferrer" class="nav-link optional-doc">
            {{ t('home.viewDocs') }}
          </a>
          <div class="display-actions">
            <LocaleSwitcher />
            <button
              class="theme-button"
              type="button"
              :aria-label="isDark ? t('home.switchToLight') : t('home.switchToDark')"
              :title="isDark ? t('home.switchToLight') : t('home.switchToDark')"
              @click="toggleTheme"
            >
              <Icon :name="isDark ? 'sun' : 'moon'" size="sm" />
            </button>
          </div>
          <router-link :to="primaryDestination" class="header-cta" data-testid="home-primary-action">
            {{ isAuthenticated ? t('home.dashboard') : t('home.login') }}
            <Icon name="arrowRight" size="sm" />
          </router-link>
        </nav>
      </div>
    </header>

    <main v-if="compactHomeEnabled" class="compact-main home-shell">
      <div class="compact-mark"><img :src="siteLogo || '/logo.svg'" :alt="siteName" /></div>
      <p class="eyebrow">{{ t('blessingHome.eyebrow') }}</p>
      <h1>{{ siteName }}</h1>
      <p class="compact-description">{{ siteSubtitle }}</p>
      <div class="hero-actions">
        <router-link :to="primaryDestination" class="home-button home-button-primary">
          {{ isAuthenticated ? t('home.goToDashboard') : t('blessingHome.start') }}
          <Icon name="arrowRight" size="sm" />
        </router-link>
        <router-link to="/guide" class="home-button home-button-secondary">{{ t('blessingHome.guide') }}</router-link>
      </div>
      <router-link v-if="showModelPlazaEntry" to="/model-plaza" class="text-link">
        <Icon name="grid" size="sm" />{{ t('nav.modelPlaza') }}
      </router-link>
    </main>

    <main v-else class="home-shell home-main">
      <section class="hero" aria-labelledby="home-title">
        <div class="hero-copy">
          <p class="eyebrow"><span class="eyebrow-dot"></span>{{ t('blessingHome.eyebrow') }}</p>
          <h1 id="home-title">{{ t('blessingHome.headline') }}<br /><span>{{ t('blessingHome.headlineAccent') }}</span></h1>
          <p class="hero-description">{{ siteSubtitle }}</p>
          <div class="hero-actions">
            <router-link :to="primaryDestination" class="home-button home-button-primary">
              {{ isAuthenticated ? t('home.goToDashboard') : t('blessingHome.start') }}
              <Icon name="arrowRight" size="sm" />
            </router-link>
            <router-link to="/guide" class="home-button home-button-secondary">
              <Icon name="book" size="sm" />{{ t('blessingHome.guide') }}
            </router-link>
          </div>
          <p class="hero-note">{{ t('blessingHome.heroNote') }}</p>
        </div>

        <div class="connection-card">
          <div class="connection-topline"><span>{{ t('blessingHome.connectionLabel') }}</span><Icon name="link" size="sm" /></div>
          <div class="connection-visual" aria-hidden="true">
            <div class="connection-orbit"></div>
            <div class="connection-center"><img :src="siteLogo || '/logo.svg'" alt="" /></div>
            <div class="connection-node node-code"><Icon name="cpu" size="lg" /></div>
            <div class="connection-node node-chat"><Icon name="chat" size="lg" /></div>
            <div class="connection-node node-key"><Icon name="key" size="lg" /></div>
          </div>
          <h2>{{ t('blessingHome.connectionTitle') }}</h2>
          <p>{{ t('blessingHome.connectionDescription') }}</p>
          <div class="connection-tags"><span>{{ t('blessingHome.tagCode') }}</span><span>{{ t('blessingHome.tagChat') }}</span><span>{{ t('blessingHome.tagWorkflow') }}</span></div>
        </div>
      </section>

      <section class="workspace-section" aria-labelledby="workspace-title">
        <div class="section-heading">
          <div><p class="eyebrow">{{ t('blessingHome.workspaceLabel') }}</p><h2 id="workspace-title">{{ t('blessingHome.workspaceTitle') }}</h2></div>
          <span class="section-note">{{ t('blessingHome.workspaceNote') }}</span>
        </div>
        <div class="workspace-grid">
          <router-link :to="isAuthenticated ? '/keys' : { path: '/login', query: { redirect: '/keys' } }" class="workspace-card">
            <span class="feature-icon feature-icon-orange"><Icon name="key" size="lg" /></span>
            <h3>{{ t('blessingHome.keysTitle') }}</h3>
            <p>{{ t('blessingHome.keysDescription') }}</p>
            <span class="card-link">{{ t('blessingHome.keysAction') }}<Icon name="arrowRight" size="sm" /></span>
          </router-link>
          <router-link :to="showModelPlazaEntry ? '/model-plaza' : '/guide'" class="workspace-card">
            <span class="feature-icon feature-icon-sage"><Icon :name="showModelPlazaEntry ? 'grid' : 'book'" size="lg" /></span>
            <h3>{{ t(showModelPlazaEntry ? 'blessingHome.modelsTitle' : 'blessingHome.toolsTitle') }}</h3>
            <p>{{ t(showModelPlazaEntry ? 'blessingHome.modelsDescription' : 'blessingHome.toolsDescription') }}</p>
            <span class="card-link">{{ t(showModelPlazaEntry ? 'blessingHome.modelsAction' : 'blessingHome.guide') }}<Icon name="arrowRight" size="sm" /></span>
          </router-link>
          <router-link to="/key-usage" class="workspace-card">
            <span class="feature-icon feature-icon-neutral"><Icon name="chart" size="lg" /></span>
            <h3>{{ t('blessingHome.usageTitle') }}</h3>
            <p>{{ t('blessingHome.usageDescription') }}</p>
            <span class="card-link">{{ t('blessingHome.usageAction') }}<Icon name="arrowRight" size="sm" /></span>
          </router-link>
        </div>
      </section>

      <section class="start-section" aria-labelledby="start-title">
        <div class="start-intro"><p class="eyebrow">{{ t('blessingHome.stepsLabel') }}</p><h2 id="start-title">{{ t('blessingHome.stepsTitle') }}</h2><router-link to="/guide" class="text-link">{{ t('blessingHome.fullGuide') }}<Icon name="arrowRight" size="sm" /></router-link></div>
        <ol class="steps-list">
          <li v-for="step in 3" :key="step"><span class="step-number">0{{ step }}</span><div><h3>{{ t(`blessingHome.step${step}Title`) }}</h3><p>{{ t(`blessingHome.step${step}Description`) }}</p></div></li>
        </ol>
      </section>
    </main>

    <footer class="home-footer">
      <div class="home-shell footer-inner">
        <span>&copy; {{ currentYear }} {{ siteName }}</span>
        <a href="https://blessingshs.cc.cd/" class="hub-return"><Icon name="arrowLeft" size="sm" />{{ t('blessingHome.backToHub') }}</a>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore, useAppStore } from '@/stores'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'
import { sanitizeUrl } from '@/utils/url'
import { getCardPurchaseUrl } from '@/utils/cardRecharge'
import { FeatureFlags, isFeatureFlagEnabled } from '@/utils/featureFlags'

const { t } = useI18n()
const authStore = useAuthStore()
const appStore = useAppStore()
const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'Blessing API')
const siteLogo = computed(() => sanitizeUrl(appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const siteSubtitle = computed(() => appStore.cachedPublicSettings?.site_subtitle || t('blessingHome.subtitle'))
const docUrl = computed(() => sanitizeUrl(appStore.cachedPublicSettings?.doc_url || appStore.docUrl || ''))
const cardPurchaseUrl = computed(() => getCardPurchaseUrl(appStore.cachedPublicSettings))
const homeContent = computed(() => appStore.cachedPublicSettings?.home_content || '')
const hasHomeContent = computed(() => homeContent.value.trim().length > 0)
const compactHomeEnabled = computed(() => appStore.cachedPublicSettings?.compact_home_enabled === true)
const isHomeContentUrl = computed(() => /^https?:\/\//.test(homeContent.value.trim()))
const isAuthenticated = computed(() => authStore.isAuthenticated)
const dashboardPath = computed(() => authStore.isAdmin ? '/admin/dashboard' : '/dashboard')
const primaryDestination = computed(() => isAuthenticated.value ? dashboardPath.value : '/login')
const showModelPlazaEntry = computed(() =>
  isFeatureFlagEnabled(FeatureFlags.modelPlaza) &&
  (isAuthenticated.value || appStore.cachedPublicSettings?.model_plaza_require_auth !== true),
)
const isDark = ref(document.documentElement.classList.contains('dark'))
const currentYear = computed(() => new Date().getFullYear())

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  isDark.value = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', isDark.value)
  authStore.checkAuth()
  if (!appStore.publicSettingsLoaded) appStore.fetchPublicSettings()
})
</script>

<style scoped>
.blessing-home { display: flex; min-height: 100vh; flex-direction: column; background: var(--hub-bg, #f8f6f2); color: var(--hub-text, #302f2b); }
.home-shell { width: min(1160px, calc(100% - 64px)); margin-inline: auto; }
.home-header { border-bottom: 1px solid var(--hub-border, #e6e1d8); }
.header-inner { display: flex; min-height: 98px; align-items: center; justify-content: space-between; gap: 24px; }
.brand { display: flex; min-width: 0; flex: 1; align-items: center; gap: 12px; }
.brand-logo { width: 42px; height: 42px; flex-shrink: 0; object-fit: contain; }
.brand-copy { display: flex; min-width: 0; flex-direction: column; gap: 4px; }
.brand-copy strong { max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 18px; font-weight: 700; letter-spacing: -.5px; }
.brand-copy > span { color: var(--hub-muted, #77736b); font-size: 9px; font-weight: 600; letter-spacing: 1.8px; }
.header-actions, .display-actions { display: flex; align-items: center; }
.header-actions { flex-shrink: 0; gap: 22px; }
.display-actions { gap: 3px; }
.nav-link { color: var(--hub-muted, #77736b); font-size: 13px; white-space: nowrap; }
.nav-link:hover, .hub-return:hover { color: var(--hub-accent, #bc633c); }
.theme-button { display: flex; width: 36px; height: 36px; align-items: center; justify-content: center; border-radius: 50%; }
.theme-button:hover { background: var(--hub-soft, #efeae2); }
.header-cta { display: inline-flex; min-height: 40px; align-items: center; justify-content: center; gap: 10px; border: 1px solid var(--hub-border, #e6e1d8); border-radius: 10px; padding: 8px 14px; background: var(--hub-panel, #fffdf9); font-size: 13px; font-weight: 600; white-space: nowrap; }
.header-cta:hover { border-color: var(--hub-accent, #bc633c); }
.home-main { flex: 1; padding-bottom: 64px; }
.hero { display: grid; grid-template-columns: 1.18fr 1fr; align-items: center; gap: 80px; padding: 86px 0 72px; }
.eyebrow { display: flex; align-items: center; gap: 9px; color: var(--hub-muted, #77736b); font-size: 11px; font-weight: 650; letter-spacing: 1.6px; line-height: 1.6; }
.eyebrow-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--hub-sage-ink, #68755e); }
.hero h1 { margin-top: 22px; font-size: clamp(40px, 4.4vw, 62px); font-weight: 650; letter-spacing: -2px; line-height: 1.26; }
.hero h1 > span { color: var(--hub-accent, #bc633c); }
.hero-description { max-width: 440px; margin-top: 25px; color: var(--hub-muted, #77736b); font-size: 16px; line-height: 1.95; white-space: pre-line; overflow-wrap: anywhere; }
.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 30px; }
.home-button { display: inline-flex; min-height: 48px; align-items: center; justify-content: center; gap: 12px; border: 1px solid transparent; border-radius: 12px; padding: 12px 20px; font-size: 14px; font-weight: 600; transition: transform 150ms ease, background 150ms ease; }
.home-button:hover { transform: translateY(-2px); }
.home-button-primary { background: var(--hub-accent, #bc633c); color: var(--hub-on-accent, #fff); }
.home-button-secondary { border-color: var(--hub-border, #e6e1d8); background: var(--hub-panel, #fffdf9); }
.hero-note { margin-top: 19px; color: var(--hub-muted, #77736b); font-size: 12px; }
.connection-card { position: relative; overflow: hidden; border: 1px solid var(--hub-border, #e6e1d8); border-radius: 28px; padding: 25px 30px 29px; background: var(--hub-panel, #fffdf9); }
.connection-topline { display: flex; align-items: center; justify-content: space-between; color: var(--hub-muted, #77736b); font-size: 10px; font-weight: 650; letter-spacing: 1.4px; }
.connection-visual { position: relative; width: 242px; height: 210px; margin: 14px auto 7px; }
.connection-orbit { position: absolute; inset: 21px 32px 11px; border: 1px dashed var(--hub-border, #e6e1d8); border-radius: 50%; }
.connection-center { position: absolute; top: 64px; left: 79px; display: grid; width: 84px; height: 84px; place-items: center; border: 1px solid color-mix(in srgb, var(--hub-accent, #bc633c) 16%, transparent); border-radius: 26px; background: color-mix(in srgb, var(--hub-accent, #bc633c) 10%, var(--hub-panel, #fffdf9)); transform: rotate(-8deg); }
.connection-center img { width: 46px; height: 46px; object-fit: contain; transform: rotate(8deg); }
.connection-node { position: absolute; display: grid; width: 48px; height: 48px; place-items: center; border: 1px solid var(--hub-border, #e6e1d8); border-radius: 15px; background: var(--hub-panel, #fffdf9); }
.node-code { top: 8px; left: 52px; color: var(--hub-accent, #bc633c); transform: rotate(-9deg); }
.node-chat { top: 71px; right: 7px; background: var(--hub-sage, #e9eee4); color: var(--hub-sage-ink, #68755e); transform: rotate(8deg); }
.node-key { bottom: 8px; left: 25px; color: var(--hub-muted, #77736b); transform: rotate(-6deg); }
.connection-card h2 { font-size: 20px; font-weight: 650; letter-spacing: -.6px; }
.connection-card > p { margin-top: 9px; color: var(--hub-muted, #77736b); font-size: 13px; line-height: 1.85; }
.connection-tags { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 21px; }
.connection-tags > span { border-radius: 6px; padding: 5px 9px; background: var(--hub-soft, #efeae2); color: var(--hub-muted, #77736b); font-size: 10px; }
.workspace-section { padding-top: 28px; border-top: 1px solid var(--hub-border, #e6e1d8); }
.section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 25px; }
.section-heading h2, .start-intro h2 { margin-top: 9px; font-size: 25px; font-weight: 650; letter-spacing: -.8px; line-height: 1.5; }
.section-note { color: var(--hub-muted, #77736b); font-size: 12px; }
.workspace-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.workspace-card { display: flex; flex-direction: column; align-items: flex-start; border: 1px solid var(--hub-border, #e6e1d8); border-radius: 19px; padding: 25px; background: var(--hub-panel, #fffdf9); transition: border-color 150ms ease, transform 150ms ease; }
.workspace-card:hover { border-color: var(--hub-accent, #bc633c); transform: translateY(-3px); }
.feature-icon { display: grid; width: 43px; height: 43px; place-items: center; border-radius: 13px; }
.feature-icon-orange { color: var(--hub-accent, #bc633c); background: color-mix(in srgb, var(--hub-accent, #bc633c) 11%, transparent); }
.feature-icon-sage { color: var(--hub-sage-ink, #68755e); background: var(--hub-sage, #e9eee4); }
.feature-icon-neutral { color: var(--hub-muted, #77736b); background: var(--hub-soft, #efeae2); }
.workspace-card h3 { margin-top: 20px; font-size: 17px; font-weight: 650; }
.workspace-card > p { flex: 1; margin-top: 9px; color: var(--hub-muted, #77736b); font-size: 13px; line-height: 1.85; }
.card-link { display: inline-flex; align-items: center; gap: 10px; margin-top: 26px; color: var(--hub-text, #302f2b); font-size: 12px; font-weight: 600; }
.card-link svg { color: var(--hub-muted, #77736b); }
.start-section { display: grid; grid-template-columns: 1fr 1.55fr; gap: 40px; margin-top: 52px; border-radius: 22px; padding: 35px 38px; background: var(--hub-soft, #efeae2); }
.text-link { display: inline-flex; align-items: center; gap: 9px; margin-top: 24px; color: var(--hub-accent, #bc633c); font-size: 13px; font-weight: 600; }
.steps-list { display: flex; flex-direction: column; gap: 22px; }
.steps-list li { display: flex; gap: 18px; }
.step-number { flex-shrink: 0; padding-top: 2px; color: var(--hub-accent, #bc633c); font-family: ui-monospace, monospace; font-size: 12px; }
.steps-list h3 { font-size: 14px; font-weight: 600; }
.steps-list p { margin-top: 5px; color: var(--hub-muted, #77736b); font-size: 12px; line-height: 1.8; }
.home-footer { margin-top: auto; border-top: 1px solid var(--hub-border, #e6e1d8); }
.footer-inner { display: flex; min-height: 84px; align-items: center; justify-content: space-between; gap: 20px; color: var(--hub-muted, #77736b); font-size: 12px; }
.hub-return { display: inline-flex; flex-shrink: 0; align-items: center; gap: 9px; }
.compact-main { display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: center; padding-block: 90px; text-align: center; }
.compact-mark { margin-bottom: 24px; border-radius: 24px; padding: 20px; background: var(--hub-soft, #efeae2); }
.compact-mark img { width: 56px; height: 56px; object-fit: contain; }
.compact-main h1 { margin-top: 15px; font-size: clamp(30px, 5vw, 48px); font-weight: 650; overflow-wrap: anywhere; }
.compact-description { max-width: 620px; margin-top: 16px; color: var(--hub-muted, #77736b); line-height: 1.9; white-space: pre-line; overflow-wrap: anywhere; }
.compact-main .hero-actions { justify-content: center; }
a:focus-visible, button:focus-visible { outline: 2px solid var(--hub-accent, #bc633c); outline-offset: 4px; }
@media (max-width: 1100px) { .header-actions { gap: 14px; } .optional-doc { display: none; } .hero { gap: 40px; } }
@media (max-width: 850px) { .home-shell { width: calc(100% - 40px); } .optional-nav { display: none; } .hero { gap: 28px; padding-top: 58px; } .hero h1 { font-size: 43px; } .connection-card { padding-inline: 22px; } .workspace-card { padding: 21px; } .section-note { display: none; } .start-section { grid-template-columns: 1fr 1.5fr; padding: 30px; } }
@media (max-width: 680px) { .header-inner { min-height: 82px; gap: 12px; } .header-actions { gap: 8px; } .brand-logo { width: 34px; height: 34px; } .brand { gap: 9px; } .brand-copy strong { max-width: 145px; font-size: 16px; } .brand-copy > span { font-size: 8px; letter-spacing: 1px; } .header-cta { min-height: 36px; padding: 7px 10px; font-size: 12px; } .header-cta svg { display: none; } .display-actions { gap: 0; } .hero { grid-template-columns: minmax(0, 1fr); gap: 36px; padding: 46px 0 40px; } .hero h1 { font-size: 45px; letter-spacing: -1.8px; } .hero-description { margin-top: 18px; font-size: 15px; } .hero-actions { margin-top: 24px; } .connection-card { padding: 23px; } .connection-visual { height: 182px; margin-block: 7px; } .connection-center { top: 49px; } .connection-card h2 { font-size: 19px; } .workspace-section { padding-top: 27px; } .workspace-grid { grid-template-columns: 1fr; gap: 12px; } .workspace-card { display: grid; grid-template-columns: 43px minmax(0, 1fr); column-gap: 17px; padding: 23px; } .feature-icon { grid-row: 1 / 4; } .workspace-card h3 { margin: 0; font-size: 16px; } .workspace-card > p { margin-top: 6px; } .card-link { margin-top: 15px; } .start-section { grid-template-columns: 1fr; gap: 28px; margin-top: 32px; padding: 27px 24px; } .text-link { margin-top: 15px; } .home-main { padding-bottom: 35px; } .footer-inner { min-height: 90px; font-size: 11px; } }
@media (max-width: 390px) { .home-shell { width: calc(100% - 32px); } .brand-copy strong { max-width: 112px; font-size: 15px; } .brand-copy > span { font-size: 7px; } .brand-logo { width: 30px; height: 30px; } .header-actions { gap: 4px; } .theme-button { width: 30px; } .hero h1 { font-size: 39px; } .home-button { padding-inline: 16px; font-size: 13px; } .hero-actions { gap: 9px; } .footer-inner { flex-wrap: wrap; justify-content: center; gap: 10px; padding-block: 22px; } }
@media (prefers-reduced-motion: reduce) { .home-button, .workspace-card { transition: none; } .home-button:hover, .workspace-card:hover { transform: none; } }
</style>
