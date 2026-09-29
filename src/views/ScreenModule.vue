<script setup>
import { computed, onMounted } from 'vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { screenCatalog } from '../router'
import { useRideStore } from '../stores/rideStore'
import { useWalletStore } from '../stores/walletStore'
import { usePaymentStore } from '../stores/paymentStore'
import { useAuthStore } from '../stores/authStore'
import ScreenPreview from '../components/common/ScreenPreview.vue'
import api from '../api/client'

const props = defineProps({ role: { type: String, required: true }, screen: { type: Object, default: null } })
const screens = computed(() => props.screen ? [props.screen] : screenCatalog.filter((screen) => screen.role === props.role))
const router = useRouter()
const rideStore = useRideStore()
const walletStore = useWalletStore()
const paymentStore = usePaymentStore()
const authStore = useAuthStore()
const selectedVehicle = ref('Boda')
const topUpAmount = ref(5000)
const feedback = ref('')
const apiStatus = ref('Checking API...')

onMounted(async () => {
  try {
    const health = await api.health()
    apiStatus.value = health.status === 'ok' ? 'API connected' : 'API available'
    await paymentStore.load()
  } catch (error) {
    apiStatus.value = 'API offline'
  }
})

function openScreen(slug) {
  router.push(`/screen/${slug}`)
}

async function requestRide() {
  try {
    await rideStore.requestRide(selectedVehicle.value)
    feedback.value = 'Ride request sent. Matching a nearby driver.'
  } catch (error) {
    feedback.value = error.message || 'Ride request failed.'
  }
}

async function topUp() {
  try {
    await paymentStore.topUp(Number(topUpAmount.value))
    walletStore.deposit(Number(topUpAmount.value))
    feedback.value = `${walletStore.currency} ${Number(topUpAmount.value).toLocaleString()} added to your wallet.`
  } catch (error) {
    feedback.value = error.message || 'Top-up failed.'
  }
}

function finishTrip() {
  if (rideStore.activeTrip && !walletStore.pay(rideStore.activeTrip.fare)) {
    feedback.value = 'Insufficient wallet balance to settle this trip.'
    return
  }
  rideStore.completeRide()
  feedback.value = 'Trip marked as completed.'
}

function signOut() {
  authStore.signOut()
  router.push('/login')
}
</script>

<template>
  <div class="module-page">
    <div class="module-intro"><span class="eyebrow">Modular view</span><h1>{{ role }} workspace</h1><p>Stitch screens are mounted here as replaceable Vue view surfaces, ready for reactive store bindings.</p></div>
    <div class="module-stats"><div><span>Mapped screens</span><strong>{{ screens.length }}</strong></div><div><span>Currency</span><strong>{{ walletStore.currency }}</strong></div><div><span>Live state</span><strong :class="rideStore.status === 'offline' ? 'warning' : 'good'">{{ rideStore.statusLabel }}</strong></div></div>
    <div class="api-status" :class="apiStatus === 'API offline' ? 'error' : 'ok'">{{ apiStatus }}</div>
    <section class="control-panel" aria-label="Workspace controls">
      <div v-if="role === 'Passenger'" class="control-group"><span class="control-label">Passenger actions</span><div class="control-row"><select v-model="selectedVehicle"><option>Boda</option><option>Tuktuk</option><option>Car</option><option>XL</option></select><button class="primary-button" @click="requestRide">Request ride</button><button class="secondary-button" @click="topUp">Top up SSP {{ Number(topUpAmount).toLocaleString() }}</button><button class="ghost-button" @click="signOut">Sign out</button></div></div>
      <div v-else-if="role === 'Driver'" class="control-group"><span class="control-label">Driver actions</span><div class="control-row"><button class="primary-button" @click="rideStore.toggleOnline">{{ rideStore.status === 'offline' ? 'Go online' : 'Go offline' }}</button><button class="secondary-button" :disabled="!rideStore.activeTrip" @click="finishTrip">Complete current trip</button><button class="ghost-button" @click="signOut">Sign out</button></div></div>
      <div v-else class="control-group"><span class="control-label">Operations actions</span><div class="control-row"><button class="primary-button" @click="rideStore.setQueue(rideStore.queue + 1); feedback = 'A dispatch request was added to the queue.'">Add dispatch request</button><button class="secondary-button" @click="rideStore.setQueue(0); feedback = 'Dispatch queue cleared.'">Clear queue</button><button class="ghost-button" @click="signOut">Sign out</button></div></div>
      <p v-if="feedback" class="feedback" role="status">{{ feedback }}</p>
    </section>
    <section v-if="!props.screen" class="screen-directory"><div class="directory-heading"><div><span class="eyebrow">Navigation</span><h2>Screen directory</h2></div><span>{{ screens.length }} surfaces</span></div><div class="screen-links"><button v-for="item in screens" :key="item.slug" @click="openScreen(item.slug)">{{ item.label }}<span>↗</span></button></div></section>
    <section v-if="role === 'Passenger'" class="wallet-status"><span class="eyebrow">Wallet balance</span><strong>{{ walletStore.formattedBalance }}</strong><span v-if="rideStore.activeTrip">Active {{ rideStore.activeTrip.vehicle }} · SSP {{ rideStore.activeTrip.fare.toLocaleString() }} · {{ rideStore.statusLabel }}</span></section>
    <div class="screen-stack"><ScreenPreview v-for="item in screens" :key="item.slug" :screen="item" /></div>
  </div>
</template>

<style scoped>
.module-page { max-width: 1440px; margin: 0 auto; }
.module-intro { max-width: 720px; margin-bottom: 28px; }
h1 { margin: 0 0 8px; font-size: clamp(26px, 4vw, 38px); letter-spacing: 0; }
p { margin: 0; color: var(--muted); line-height: 1.6; }
.module-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 28px; }
.module-stats > div { padding: 16px 18px; background: var(--surface-low); border: 1px solid var(--outline); border-radius: 10px; }
.module-stats span, .module-stats strong { display: block; }
.module-stats span { color: var(--muted); font-size: 11px; text-transform: uppercase; letter-spacing: .08em; }
.module-stats strong { margin-top: 8px; font-size: 24px; }
.good { color: var(--success); }
.warning { color: var(--primary-soft); }
.control-panel, .screen-directory, .wallet-status { margin-bottom: 24px; padding: 18px; background: var(--surface-low); border: 1px solid var(--outline); border-radius: 12px; }
.control-group { display: grid; gap: 10px; }
.control-label { color: var(--muted); font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.control-row { display: flex; flex-wrap: wrap; gap: 10px; }
select, button { min-height: 40px; padding: 0 14px; border: 1px solid var(--outline); border-radius: 7px; background: var(--surface-container); color: var(--on-surface); font-weight: 700; }
select:focus, button:focus { outline: 2px solid var(--primary); outline-offset: 2px; }
.primary-button { border-color: var(--primary); background: var(--primary); color: #472a00; }
.secondary-button:hover, .screen-links button:hover { border-color: var(--primary); color: var(--primary-soft); }
.ghost-button { border-color: rgba(148,163,184,.38); background: transparent; color: var(--muted); }
button:disabled { cursor: not-allowed; opacity: .45; }
.feedback { margin: 12px 0 0; color: var(--success); font-size: 13px; }
.directory-heading { display: flex; align-items: start; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
.directory-heading h2 { margin: 0; font-size: 18px; }
.directory-heading > span { color: var(--muted); font-size: 12px; }
.screen-links { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.screen-links button { display: flex; align-items: center; justify-content: space-between; text-align: left; }
.screen-links span { color: var(--primary-soft); }
.wallet-status { display: grid; gap: 6px; }
.wallet-status strong { color: var(--primary-soft); font-size: 26px; }
.wallet-status > span:last-child { color: var(--muted); font-size: 12px; }
.screen-stack { display: grid; gap: 24px; }
.api-status { margin: 0 0 24px; display: inline-flex; align-items: center; padding: 8px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.api-status.ok { background: rgba(34,197,94,.12); color: var(--success); }
.api-status.error { background: rgba(239,68,68,.12); color: #fca5a5; }
@media (max-width: 800px) { .screen-links { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 600px) { .module-stats { grid-template-columns: 1fr; } .screen-links { grid-template-columns: 1fr; } }
</style>
