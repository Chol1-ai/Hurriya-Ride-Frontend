<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRideStore } from '../stores/rideStore'
import { useAuthStore } from '../stores/authStore'
import RideLocationMap from '../components/passenger/RideLocationMap.vue'
import ScreenPreview from '../components/common/ScreenPreview.vue'
import api from '../api/client'

const props = defineProps({
  role: { type: String, required: true },
  screen: { type: Object, default: null },
  section: { type: String, default: 'overview' },
})
const router = useRouter()
const rideStore = useRideStore()
const authStore = useAuthStore()
const isPassenger = computed(() => props.role === 'Passenger')
const isDriver = computed(() => props.role === 'Driver')
const isFleet = computed(() => props.role === 'Fleet')
const isAdmin = computed(() => props.role === 'Admin')
const dashboardTitle = computed(() => {
  if (isPassenger.value) return ({ overview: 'Book a ride', rides: 'Ride history', wallet: 'Wallet' }[props.section] || 'Passenger workspace')
  if (isAdmin.value) return ({ overview: 'Operations overview', accounts: 'Manage accounts', drivers: 'Driver roster', ledger: 'Revenue ledger' }[props.section] || 'Admin workspace')
  if (isFleet.value) return props.section === 'drivers' ? 'Fleet drivers' : 'Fleet overview'
  return ({ Driver: 'Driver desk', Fleet: 'Fleet overview', Admin: 'Operations overview' }[props.role] || 'Dashboard')
})
const subtitle = computed(() => {
  if (isPassenger.value) return ({
    overview: 'Request a ride from your current location or enter a pickup.',
    rides: 'Review the rides associated with your account.',
    wallet: 'Top up your wallet and review recorded transactions.',
  }[props.section] || '')
  if (isAdmin.value && props.section === 'drivers') return 'Review drivers currently marked available.'
  if (isAdmin.value && props.section === 'ledger') return 'Review payment records saved in the database.'
  if (isAdmin.value && props.section === 'accounts') return 'Create the Driver and Fleet accounts that can access their private sign-in routes.'
  if (isFleet.value && props.section === 'drivers') return 'Review drivers currently available in the fleet.'
  return ({
    Driver: 'Review your driver account and availability.',
    Fleet: 'Monitor drivers currently available in the fleet.',
    Admin: 'Live totals from the Hurriya Ride database.',
  }[props.role] || '')
})

const rides = ref([])
const payments = ref([])
const adminPayments = ref([])
const managedAccounts = ref([])
const drivers = ref([])
const overview = ref(null)
const accountForm = ref({ name: '', email: '', password: '', role: 'Driver', phone: '', vehicle: 'Boda' })
const pickup = ref({ label: '', lat: null, lng: null })
const destination = ref({ label: '', lat: null, lng: null })
const routeInfo = ref(null)
const vehicleType = ref('Boda')
const topUpAmount = ref(5000)
const loading = ref(false)
const submitting = ref(false)
const apiStatus = ref('Checking connection')
const errorMessage = ref('')
const feedback = ref('')

const totalTopups = computed(() => payments.value.reduce((total, item) => total + Number(item.amount || 0), 0))
const recordedRevenue = computed(() => adminPayments.value
  .filter((payment) => payment.status === 'Completed')
  .reduce((total, payment) => total + Number(payment.amount || 0), 0))
const activeRideCount = computed(() => rides.value.filter((ride) => !['Completed', 'Cancelled'].includes(ride.status)).length)
const driverIsOnline = computed(() => rideStore.status !== 'offline')

function formatAmount(amount) {
  return `SSP ${Number(amount || 0).toLocaleString()}`
}

function formatDistance(distanceMeters) {
  return Number.isFinite(Number(distanceMeters)) && distanceMeters != null
    ? `${(Number(distanceMeters) / 1000).toFixed(1)} km`
    : '—'
}

function formatDate(value) {
  if (!value) return 'Just now'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

async function loadDashboard() {
  loading.value = true
  errorMessage.value = ''
  try {
    const health = await api.health()
    apiStatus.value = health.status === 'ok' ? 'Connected' : 'Available'

    if (isPassenger.value) {
      const [rideResponse, paymentResponse] = await Promise.all([api.getRides(), api.getPayments()])
      rides.value = rideResponse.rides || []
      payments.value = paymentResponse.payments || []
    } else if (isAdmin.value) {
      if (props.section === 'drivers') {
        const response = await api.getDrivers()
        drivers.value = response.drivers || []
      } else if (props.section === 'ledger') {
        const response = await api.getAdminPayments()
        adminPayments.value = response.payments || []
      } else if (props.section === 'accounts') {
        const response = await api.getAdminAccounts()
        managedAccounts.value = response.accounts || []
      } else {
        const response = await api.getAdminOverview()
        overview.value = response.overview
      }
    } else if (isFleet.value) {
      const response = await api.getDrivers()
      drivers.value = response.drivers || []
    }
  } catch (error) {
    apiStatus.value = 'Disconnected'
    errorMessage.value = error.message || 'Could not load dashboard data.'
  } finally {
    loading.value = false
  }
}

async function requestRide() {
  if (!pickup.value.label.trim() || !destination.value.label.trim()) {
    errorMessage.value = 'Pin and name both a pickup and destination.'
    return
  }
  if (!Number.isFinite(pickup.value.lat) || !Number.isFinite(pickup.value.lng)
    || !Number.isFinite(destination.value.lat) || !Number.isFinite(destination.value.lng)) {
    errorMessage.value = 'Select both locations on the map before requesting a ride.'
    return
  }

  submitting.value = true
  errorMessage.value = ''
  feedback.value = ''
  try {
    const response = await api.requestRide({
      pickup: pickup.value.label.trim(),
      destination: destination.value.label.trim(),
      vehicleType: vehicleType.value,
      pickupCoordinates: { lat: pickup.value.lat, lng: pickup.value.lng },
      destinationCoordinates: { lat: destination.value.lat, lng: destination.value.lng },
      distanceMeters: routeInfo.value?.distanceMeters ?? null,
    })
    if (response.ride) rides.value = [response.ride, ...rides.value]
    feedback.value = 'Ride request saved.'
  } catch (error) {
    errorMessage.value = error.message || 'Ride request failed.'
  } finally {
    submitting.value = false
  }
}

async function topUp() {
  const amount = Number(topUpAmount.value)
  if (!Number.isFinite(amount) || amount <= 0) {
    errorMessage.value = 'Enter a top-up amount greater than zero.'
    return
  }

  submitting.value = true
  errorMessage.value = ''
  feedback.value = ''
  try {
    const response = await api.topup(amount)
    if (response.payment) payments.value = [response.payment, ...payments.value]
    feedback.value = `${formatAmount(amount)} top-up recorded.`
  } catch (error) {
    errorMessage.value = error.message || 'Top-up failed.'
  } finally {
    submitting.value = false
  }
}

async function createManagedAccount() {
  errorMessage.value = ''
  feedback.value = ''
  if (accountForm.value.password.length < 12) {
    errorMessage.value = 'Use a password of at least 12 characters.'
    return
  }
  if (accountForm.value.role === 'Driver' && (!accountForm.value.phone.trim() || !accountForm.value.vehicle.trim())) {
    errorMessage.value = 'Enter the Driver phone number and vehicle.'
    return
  }

  submitting.value = true
  try {
    const response = await api.createAdminAccount({
      name: accountForm.value.name.trim(),
      email: accountForm.value.email.trim(),
      password: accountForm.value.password,
      role: accountForm.value.role,
      phone: accountForm.value.phone.trim(),
      vehicle: accountForm.value.vehicle.trim(),
    })
    managedAccounts.value = [response.account, ...managedAccounts.value]
    feedback.value = `${response.account.role} account created. Sign in at ${response.loginPath}.`
    accountForm.value = { name: '', email: '', password: '', role: 'Driver', phone: '', vehicle: 'Boda' }
  } catch (error) {
    errorMessage.value = error.message || 'Could not create the staff account.'
  } finally {
    submitting.value = false
  }
}

function toggleDemoAvailability() {
  rideStore.toggleOnline()
  feedback.value = `Demo availability set to ${driverIsOnline.value ? 'online' : 'offline'}. This setting is local to this browser.`
}

function signOut() {
  authStore.signOut()
  router.push('/login')
}

function goToDashboard() {
  router.push(({ Passenger: '/passenger', Driver: '/driver', Fleet: '/fleet', Admin: '/admin' }[props.role]) || '/')
}

onMounted(loadDashboard)
</script>

<template>
  <main class="dashboard-page">
    <template v-if="props.screen">
      <div class="preview-toolbar">
        <button class="text-button" @click="goToDashboard">Back to dashboard</button>
        <span class="connection-state" :class="apiStatus === 'Disconnected' ? 'is-error' : ''">{{ apiStatus }}</span>
      </div>
      <ScreenPreview :screen="props.screen" />
    </template>

    <template v-else>
      <header class="page-heading">
        <div>
          <p class="eyebrow">{{ role }} / workspace</p>
          <h1>{{ dashboardTitle }}</h1>
          <p class="page-subtitle">{{ subtitle }}</p>
        </div>
        <div class="heading-actions">
          <span class="connection-state" :class="apiStatus === 'Disconnected' ? 'is-error' : ''"><i></i>{{ apiStatus }}</span>
          <button class="button button-secondary" :disabled="loading" @click="loadDashboard">{{ loading ? 'Refreshing' : 'Refresh' }}</button>
          <button class="button button-secondary" @click="signOut">Sign out</button>
        </div>
      </header>

      <p v-if="errorMessage" class="notice notice-error" role="alert">{{ errorMessage }}</p>
      <p v-if="feedback" class="notice notice-success" role="status">{{ feedback }}</p>

      <template v-if="isAdmin && section === 'accounts'">
        <section class="data-section">
          <div class="section-heading"><div><p class="eyebrow">Staff access</p><h2>Create staff account</h2></div></div>
          <form class="account-form" @submit.prevent="createManagedAccount">
            <label>Role<select v-model="accountForm.role"><option>Driver</option><option>Fleet</option><option>Admin</option></select></label>
            <label>Full name<input v-model="accountForm.name" autocomplete="name" required></label>
            <label>Email<input v-model="accountForm.email" type="email" autocomplete="email" required></label>
            <label>Temporary password<input v-model="accountForm.password" type="password" autocomplete="new-password" minlength="12" required></label>
            <template v-if="accountForm.role === 'Driver'">
              <label>Phone<input v-model="accountForm.phone" type="tel" autocomplete="tel" required></label>
              <label>Vehicle<input v-model="accountForm.vehicle" required></label>
            </template>
            <button class="button button-primary" type="submit" :disabled="submitting">{{ submitting ? 'Creating…' : 'Create account' }}</button>
          </form>
          <p class="plain-copy account-note">Passenger accounts use public registration. Driver and Fleet accounts are created here by an Admin.</p>
        </section>
        <section class="data-section">
          <div class="section-heading"><div><p class="eyebrow">Managed access</p><h2>Driver and Fleet accounts</h2></div></div>
          <div v-if="managedAccounts.length" class="table-scroll"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th></tr></thead><tbody>
            <tr v-for="account in managedAccounts" :key="account.id"><td><strong>{{ account.name }}</strong></td><td>{{ account.email }}</td><td><span class="status-label">{{ account.role }}</span></td><td>{{ formatDate(account.createdAt) }}</td></tr>
          </tbody></table></div>
          <p v-else class="empty-state">No Driver or Fleet accounts have been created yet.</p>
        </section>
      </template>

      <template v-if="isPassenger && section === 'overview'">
        <section class="dashboard-photo passenger-photo" aria-label="Hurriya rides in Juba">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Juba_City.jpg/1920px-Juba_City.jpg" alt="Aerial panorama of Juba, South Sudan" loading="lazy">
        </section>
        <section class="action-section" aria-labelledby="request-heading">
          <div class="section-heading"><div><p class="eyebrow">New request</p><h2 id="request-heading">Book a ride</h2></div></div>
          <RideLocationMap
            v-model:pickup="pickup"
            v-model:destination="destination"
            @route="routeInfo = $event"
          />
          <form class="ride-form" @submit.prevent="requestRide">
            <label>Pickup<input v-model="pickup.label" required autocomplete="street-address" placeholder="Pin on map or enter a label"></label>
            <label>Destination<input v-model="destination.label" required autocomplete="street-address" placeholder="Pin on map or enter a label"></label>
            <label>Vehicle<select v-model="vehicleType"><option>Boda</option><option>Tuktuk</option><option>Car</option><option>XL</option></select></label>
            <button class="button button-primary" type="submit" :disabled="submitting">{{ submitting ? 'Sending…' : 'Request ride' }}</button>
          </form>
        </section>

        <section class="metric-strip" aria-label="Passenger activity">
          <div><span>Active rides</span><strong>{{ activeRideCount }}</strong></div>
          <div><span>Total rides</span><strong>{{ rides.length }}</strong></div>
        </section>
      </template>

      <template v-else-if="isPassenger && section === 'rides'">
        <section class="data-section">
          <div class="section-heading"><div><p class="eyebrow">Your activity</p><h2>Recent rides</h2></div></div>
          <div v-if="rides.length" class="table-scroll"><table><thead><tr><th>Route</th><th>Distance</th><th>Vehicle</th><th>Status</th><th>Fare</th><th>Requested</th></tr></thead><tbody>
            <tr v-for="ride in rides" :key="ride.id"><td><strong>{{ ride.pickup }}</strong><span class="route-destination">{{ ride.destination }}</span></td><td>{{ formatDistance(ride.distanceMeters) }}</td><td>{{ ride.vehicleType }}</td><td><span class="status-label">{{ ride.status }}</span></td><td>{{ formatAmount(ride.fare) }}</td><td>{{ formatDate(ride.createdAt) }}</td></tr>
          </tbody></table></div>
          <p v-else class="empty-state">No rides yet.</p>
        </section>
      </template>

      <template v-else-if="isPassenger && section === 'wallet'">
        <section class="action-section wallet-action">
          <div class="section-heading"><div><p class="eyebrow">Wallet</p><h2>Add funds</h2></div></div>
          <form class="topup-form" @submit.prevent="topUp">
            <label for="topup-amount">Top-up amount (SSP)</label>
            <input id="topup-amount" v-model.number="topUpAmount" type="number" min="1" step="500" required>
            <button class="button button-primary" type="submit" :disabled="submitting">{{ submitting ? 'Adding…' : 'Add funds' }}</button>
          </form>
        </section>
        <section class="metric-strip" aria-label="Wallet totals">
          <div><span>Recorded top-ups</span><strong>{{ formatAmount(totalTopups) }}</strong></div>
          <div><span>Transactions</span><strong>{{ payments.length }}</strong></div>
        </section>
        <section class="data-section">
          <div class="section-heading"><div><p class="eyebrow">Wallet activity</p><h2>Recent top-ups</h2></div></div>
          <div v-if="payments.length" class="table-scroll"><table><thead><tr><th>Type</th><th>Status</th><th>Amount</th><th>Date</th></tr></thead><tbody>
            <tr v-for="payment in payments" :key="payment.id"><td>{{ payment.type }}</td><td><span class="status-label">{{ payment.status }}</span></td><td>{{ formatAmount(payment.amount) }}</td><td>{{ formatDate(payment.createdAt) }}</td></tr>
          </tbody></table></div>
          <p v-else class="empty-state">No wallet transactions yet.</p>
        </section>
      </template>

      <template v-else-if="isAdmin && section === 'overview'">
        <section class="metric-strip" aria-label="Operations totals">
          <div><span>Total rides</span><strong>{{ overview?.rideCount ?? '—' }}</strong></div>
          <div><span>Payments</span><strong>{{ overview?.paymentCount ?? '—' }}</strong></div>
          <div><span>Drivers</span><strong>{{ overview?.driverCount ?? '—' }}</strong></div>
          <div><span>Recorded revenue</span><strong>{{ formatAmount(overview?.revenue) }}</strong></div>
        </section>
        <section class="data-section"><div class="section-heading"><div><p class="eyebrow">System status</p><h2>Database-backed overview</h2></div></div><p class="plain-copy">These totals come from rides, payments, and drivers stored in PostgreSQL.</p></section>
      </template>

      <template v-else-if="isAdmin && section === 'drivers'">
        <section class="metric-strip" aria-label="Available driver total"><div><span>Available drivers</span><strong>{{ drivers.length }}</strong></div></section>
        <section class="data-section">
          <div class="section-heading"><div><p class="eyebrow">Current API data</p><h2>Available drivers</h2></div></div>
          <div v-if="drivers.length" class="table-scroll"><table><thead><tr><th>Driver</th><th>Vehicle</th><th>Phone</th><th>Rating</th><th>Status</th></tr></thead><tbody>
            <tr v-for="driver in drivers" :key="driver.id"><td><strong>{{ driver.name }}</strong></td><td>{{ driver.vehicle || '—' }}</td><td>{{ driver.phone || '—' }}</td><td>{{ Number(driver.rating).toFixed(1) }}</td><td><span class="status-label">{{ driver.status }}</span></td></tr>
          </tbody></table></div>
          <p v-else class="empty-state">No available drivers were returned by the API.</p>
          <p class="plain-copy">Driver documents and verification states are not stored by the current backend, so this page is a read-only roster.</p>
        </section>
      </template>

      <template v-else-if="isAdmin && section === 'ledger'">
        <section class="metric-strip" aria-label="Payment totals"><div><span>Payment records</span><strong>{{ adminPayments.length }}</strong></div><div><span>Completed revenue</span><strong>{{ formatAmount(recordedRevenue) }}</strong></div></section>
        <section class="data-section">
          <div class="section-heading"><div><p class="eyebrow">All accounts</p><h2>Payment records</h2></div></div>
          <div v-if="adminPayments.length" class="table-scroll"><table><thead><tr><th>Account</th><th>Type</th><th>Status</th><th>Amount</th><th>Date</th></tr></thead><tbody>
            <tr v-for="payment in adminPayments" :key="payment.id"><td><strong>{{ payment.user?.name || `User ${payment.userId}` }}</strong><span class="route-destination">{{ payment.user?.email || 'Account' }}</span></td><td>{{ payment.type }}</td><td><span class="status-label">{{ payment.status }}</span></td><td>{{ formatAmount(payment.amount) }}</td><td>{{ formatDate(payment.createdAt) }}</td></tr>
          </tbody></table></div>
          <p v-else class="empty-state">No payment records yet.</p>
        </section>
      </template>

      <template v-else-if="isFleet && section === 'overview'">
        <section class="metric-strip" aria-label="Fleet totals"><div><span>Available drivers</span><strong>{{ drivers.length }}</strong></div></section>
        <section class="data-section"><div class="section-heading"><div><p class="eyebrow">Fleet operations</p><h2>Driver roster</h2></div><button class="button button-secondary" @click="router.push('/fleet/drivers')">View drivers</button></div><p class="plain-copy">Browse the current availability list on its own page.</p></section>
      </template>

      <template v-else-if="isFleet && section === 'drivers'">
        <section class="metric-strip" aria-label="Fleet totals"><div><span>Available drivers</span><strong>{{ drivers.length }}</strong></div></section>
        <section class="data-section">
          <div class="section-heading"><div><p class="eyebrow">Live roster</p><h2>Available drivers</h2></div></div>
          <div v-if="drivers.length" class="table-scroll"><table><thead><tr><th>Driver</th><th>Vehicle</th><th>Phone</th><th>Rating</th><th>Status</th></tr></thead><tbody>
            <tr v-for="driver in drivers" :key="driver.id"><td><strong>{{ driver.name }}</strong></td><td>{{ driver.vehicle || '—' }}</td><td>{{ driver.phone || '—' }}</td><td>{{ Number(driver.rating).toFixed(1) }}</td><td><span class="status-label">{{ driver.status }}</span></td></tr>
          </tbody></table></div>
          <p v-else class="empty-state">No available drivers were returned by the API.</p>
        </section>
      </template>

      <template v-else-if="isDriver">
        <section class="dashboard-photo driver-photo" aria-label="Driver on a city motorcycle">
          <img src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=85" alt="Motorcycle ready for a city ride" loading="lazy">
        </section>
        <section class="driver-status-section">
          <div><p class="eyebrow">Availability preview</p><h2><span class="availability-dot" :class="driverIsOnline ? 'is-online' : ''"></span>{{ driverIsOnline ? 'Online' : 'Offline' }}</h2><p class="plain-copy">This toggle is a local demo state. Driver availability and trip dispatch are not yet persisted by the backend.</p></div>
          <button class="button" :class="driverIsOnline ? 'button-secondary' : 'button-primary'" @click="toggleDemoAvailability">{{ driverIsOnline ? 'Go offline' : 'Go online' }}</button>
        </section>
        <section class="data-section"><div class="section-heading"><div><p class="eyebrow">Next capability</p><h2>Trip assignments</h2></div></div><p class="empty-state">The current API does not yet provide a driver trip queue or accept/complete-trip actions.</p></section>
      </template>

    </template>
  </main>
</template>

<style scoped>
.dashboard-page { max-width: 1360px; margin: 0 auto; color: var(--on-surface); }
.page-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; padding: 4px 0 24px; border-bottom: 1px solid var(--outline); }
.dashboard-photo { position: relative; height: 150px; margin: 22px 0 4px; overflow: hidden; background: var(--surface-low); }
.dashboard-photo img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: center 52%; }
.eyebrow { margin: 0 0 7px; color: var(--muted); font-size: 11px; font-weight: 700; text-transform: uppercase; }
h1, h2, p { margin-top: 0; }
h1 { margin-bottom: 7px; font-size: 30px; line-height: 1.2; }
h2 { margin-bottom: 0; font-size: 18px; line-height: 1.35; }
.page-subtitle, .plain-copy { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.55; }
.heading-actions { display: flex; align-items: center; gap: 12px; }
.connection-state { display: inline-flex; align-items: center; gap: 7px; color: var(--success); font-size: 12px; font-weight: 700; white-space: nowrap; }
.connection-state i, .availability-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
.connection-state.is-error { color: var(--danger); }
.button { min-height: 42px; padding: 0 16px; border: 1px solid var(--outline); border-radius: 6px; background: var(--surface-container); color: var(--on-surface); font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }
.button:hover:not(:disabled) { border-color: var(--primary); }
.button:focus-visible, input:focus-visible, select:focus-visible, summary:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.button:disabled { cursor: wait; opacity: .65; }
.button-primary { border-color: var(--primary); background: var(--primary); color: #261700; }
.button-secondary { background: transparent; }
.notice { margin: 16px 0 0; padding: 11px 14px; border-left: 3px solid; font-size: 13px; }
.notice-error { border-color: var(--danger); background: rgba(239,68,68,.08); color: #ffaaaa; }
.notice-success { border-color: var(--success); background: rgba(16,185,129,.08); color: #8ce5c3; }
.action-section { display: grid; grid-template-columns: 1fr auto; gap: 18px 28px; align-items: end; padding: 24px 0; border-bottom: 1px solid var(--outline); }
.section-heading { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 16px; }
.section-heading .eyebrow { margin-bottom: 5px; }
.ride-form { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(140px, 1fr) minmax(140px, 1fr) minmax(115px, .65fr) auto; align-items: end; gap: 12px; }
label { display: grid; gap: 6px; color: var(--muted); font-size: 12px; font-weight: 600; }
input, select { width: 100%; min-width: 0; min-height: 42px; padding: 0 11px; border: 1px solid var(--outline); border-radius: 5px; background: var(--surface-low); color: var(--on-surface); font: inherit; font-size: 13px; }
.topup-form { display: flex; align-items: end; gap: 10px; }
.topup-form label { min-width: 130px; }
.topup-form input { width: 130px; }
.wallet-action { display: block; }
.metric-strip { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; margin: 20px 0 4px; border-top: 1px solid var(--outline); border-bottom: 1px solid var(--outline); }
.metric-strip > div { min-width: 0; padding: 17px 20px 17px 0; }
.metric-strip > div + div { padding-left: 20px; border-left: 1px solid var(--outline); }
.metric-strip span, .metric-strip strong { display: block; }
.metric-strip span { color: var(--muted); font-size: 12px; }
.metric-strip strong { margin-top: 8px; overflow-wrap: anywhere; color: var(--on-surface); font-size: 21px; font-variant-numeric: tabular-nums; }
.data-section { padding: 24px 0; border-bottom: 1px solid var(--outline); }
.data-section .section-heading { margin-bottom: 12px; }
.account-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: end; gap: 14px; max-width: 960px; }
.account-form .button { width: fit-content; }
.account-note { margin-top: 14px; }
.table-scroll { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
th { padding: 10px 14px 10px 0; color: var(--muted); font-size: 11px; font-weight: 700; text-transform: uppercase; white-space: nowrap; }
td { padding: 13px 14px 13px 0; border-top: 1px solid rgba(51,65,85,.7); vertical-align: middle; }
td strong, .route-destination { display: block; }
.route-destination { margin-top: 4px; color: var(--muted); font-size: 12px; }
.status-label { display: inline-block; padding: 4px 8px; border: 1px solid var(--outline); border-radius: 4px; color: var(--primary-soft); font-size: 11px; text-transform: capitalize; white-space: nowrap; }
.empty-state { margin: 0; padding: 18px 0; color: var(--muted); font-size: 13px; line-height: 1.5; }
.driver-status-section { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 24px 0; border-bottom: 1px solid var(--outline); }
.driver-status-section h2 { display: flex; align-items: center; gap: 9px; margin-bottom: 8px; }
.availability-dot { display: inline-block; background: var(--muted); }
.availability-dot.is-online { background: var(--success); }
.text-button { display: flex; justify-content: space-between; gap: 12px; min-height: 42px; padding: 10px 0; border: 0; border-top: 1px solid rgba(51,65,85,.7); background: transparent; color: var(--on-surface); font: inherit; font-size: 13px; text-align: left; cursor: pointer; }
.text-button:hover { color: var(--primary-soft); }
.preview-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.text-button { width: fit-content; min-height: auto; border: 0; color: var(--primary-soft); }
@media (max-width: 760px) {
  .page-heading { flex-direction: column; }
  .heading-actions { width: 100%; justify-content: space-between; }
  .action-section { grid-template-columns: 1fr; }
  .ride-form { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ride-form .button { align-self: end; }
  .metric-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .metric-strip > div { padding: 14px 12px 14px 0; }
  .metric-strip > div + div { padding-left: 12px; }
  .metric-strip > div:nth-child(3) { padding-left: 0; border-top: 1px solid var(--outline); border-left: 0; }
  .metric-strip > div:nth-child(4) { border-top: 1px solid var(--outline); }
  .topup-form { justify-content: flex-start; flex-wrap: wrap; }
}
@media (max-width: 480px) {
  .dashboard-photo { height: 124px; margin-top: 16px; }
  .account-form { grid-template-columns: 1fr; }
  h1 { font-size: 25px; }
  .ride-form { grid-template-columns: 1fr; }
  .ride-form .button { width: 100%; }
  .topup-form { display: grid; grid-template-columns: 1fr 1fr; }
  .topup-form label { grid-column: 1 / -1; }
  .topup-form input { width: 100%; }
  .topup-form .button { width: 100%; }
  .driver-status-section { align-items: flex-start; flex-direction: column; }
  table { min-width: 620px; }
}
</style>
