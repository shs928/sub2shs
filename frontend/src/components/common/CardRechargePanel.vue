<template>
  <section v-if="shopUrl" class="card p-6" aria-labelledby="card-recharge-title">
    <p class="text-xs font-semibold tracking-widest text-primary-600 dark:text-primary-400">BLESSING API</p>
    <h2 id="card-recharge-title" class="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
      {{ t('blessingRecharge.title') }}
    </h2>
    <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-dark-300">{{ t('blessingRecharge.description') }}</p>
    <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
      <div v-for="amount in CARD_DENOMINATIONS" :key="amount" class="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-dark-600 dark:bg-dark-800">
        <p class="text-lg font-semibold text-gray-900 dark:text-white">¥{{ amount }}</p>
        <p class="mt-1 text-xs text-gray-600 dark:text-dark-300">{{ t('blessingRecharge.credit', { amount }) }}</p>
      </div>
    </div>
    <ol class="mt-5 space-y-2 text-sm leading-6 text-gray-600 dark:text-dark-300">
      <li>{{ t('blessingRecharge.stepOne') }}</li>
      <li>{{ t('blessingRecharge.stepTwo') }}</li>
      <li>{{ t('blessingRecharge.stepThree') }}</li>
    </ol>
    <a :href="shopUrl" target="_blank" rel="noopener noreferrer" class="btn btn-primary mt-5 inline-flex items-center gap-2">
      {{ t('blessingRecharge.buy') }}<span aria-hidden="true">↗</span>
    </a>
    <p class="mt-3 text-xs leading-5 text-gray-500 dark:text-dark-400">{{ t('blessingRecharge.note') }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CARD_DENOMINATIONS, parseCardShopUrl } from '@/utils/cardRecharge'

const props = defineProps<{ purchaseUrl: string }>()
const { t } = useI18n()
const shopUrl = computed(() => parseCardShopUrl(props.purchaseUrl))
</script>
