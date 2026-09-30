<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
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
  return ({ Driver: 'Juba driver desk', Fleet: 'Fleet overview', Admin: 'Operations overview' }[props.role] || 'Dashboard')
})
const subtitle = computed(() => {
  if (isPassenger.value) return ({
    overview: 'Request a ride from your current location across Juba, South Sudan.',
    rides: 'Review the rides associated with your account.',
    wallet: 'Top up your wallet and review recorded transactions.',
  }[props.section] || '')
  if (isAdmin.value && props.section === 'drivers') return 'Review drivers currently marked available across Juba.'
  if (isAdmin.value && props.section === 'ledger') return 'Review SSP payment records saved in the database.'
  if (isAdmin.value && props.section === 'accounts') return 'Create the Driver and Fleet accounts that can access their private sign-in routes.'
  if (isFleet.value && props.section === 'drivers') return 'Review drivers currently available in the Juba fleet.'
  return ({
    Driver: 'Review your Juba boda account, status, and city dispatch queue.',
    Fleet: 'Monitor Juba drivers currently available in the fleet.',
    Admin: 'Live totals from the Hurriya Ride database in South Sudan.',
  }[props.role] || '')
})

const rides = ref([])
const payments = ref([])
const adminPayments = ref([])
const managedAccounts = ref([])
const drivers = ref([])
const driverProfile = ref(null)
const driverRequests = ref([])
const activeDriverRide = ref(null)
const overview = ref(null)
const accountForm = ref({ name: '', email: '', password: '', role: 'Driver', phone: '', vehicle: 'Boda' })
const pickup = ref({ label: '', lat: null, lng: null })
const destination = ref({ label: '', lat: null, lng: null })
const routeInfo = ref(null)
const vehicleType = ref('Boda')
const topUpAmount = ref(5000)
const loading = ref(false)
const submitting = ref(false)
const driverActionBusy = ref(false)
const apiStatus = ref('Checking connection')
const errorMessage = ref('')
const feedback = ref('')

const totalTopups = computed(() => payments.value.reduce((total, item) => total + Number(item.amount || 0), 0))
const recordedRevenue = computed(() => adminPayments.value
  .filter((payment) => payment.status === 'Completed')
  .reduce((total, payment) => total + Number(payment.amount || 0), 0))
const activeRideCount = computed(() => rides.value.filter((ride) => !['Completed', 'Cancelled'].includes(ride.status)).length)
const driverIsOnline = computed(() => driverProfile.value?.status === 'Available')
const driverStatusLabel = computed(() => {
  if (activeDriverRide.value?.status === 'In progress') return 'On trip in Juba'
  if (activeDriverRide.value) return 'Pickup assigned in Juba'
  return driverIsOnline.value ? 'Online in Juba' : 'Offline in Juba'
})

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
    } else if (isDriver.value) {
      await refreshDriverWorkspace()
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

async function refreshDriverWorkspace() {
  const response = await api.getDriverWorkspace()
  driverProfile.value = response.driver
  driverRequests.value = response.requests || []
  activeDriverRide.value = response.activeRide || null
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

async function toggleDriverAvailability() {
  if (!driverProfile.value || activeDriverRide.value) return
  submitting.value = true
  errorMessage.value = ''
  feedback.value = ''
  try {
    const response = await api.setDriverAvailability(!driverIsOnline.value)
    driverProfile.value = response.driver
    feedback.value = `You are now ${driverIsOnline.value ? 'online for Juba dispatch' : 'offline for Juba dispatch'}.`
  } catch (error) {
    errorMessage.value = error.message || 'Could not update your availability.'
  } finally {
    submitting.value = false
  }
}

async function runDriverAction(action, successMessage) {
  driverActionBusy.value = true
  errorMessage.value = ''
  feedback.value = ''
  try {
    await action()
    await refreshDriverWorkspace()
    feedback.value = successMessage
  } catch (error) {
    errorMessage.value = error.message || 'Could not update this trip.'
  } finally {
    driverActionBusy.value = false
  }
}

function acceptRide(rideId) {
  return runDriverAction(() => api.acceptDriverRide(rideId), 'Trip accepted. Head to the pickup point in Juba.')
}

function startRide(rideId) {
  return runDriverAction(() => api.startDriverRide(rideId), 'Trip started. Ride safely across Juba.')
}

function completeRide(rideId) {
  return runDriverAction(() => api.completeDriverRide(rideId), 'Trip complete. You are available for another Juba request.')
}

function pickupDirections(ride) {
  const destination = ride.pickupLat != null && ride.pickupLng != null
    ? `${ride.pickupLat},${ride.pickupLng}`
    : ride.pickup
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
}

function signOut() {
  authStore.signOut()
  router.push('/login')
}

function goToDashboard() {
  router.push(({ Passenger: '/passenger', Driver: '/driver', Fleet: '/fleet', Admin: '/admin' }[props.role]) || '/')
}

let driverRefreshTimer

onMounted(() => {
  loadDashboard()
  if (isDriver.value) {
    driverRefreshTimer = window.setInterval(() => {
      refreshDriverWorkspace().catch((error) => {
        errorMessage.value = error.message || 'Could not refresh trip requests.'
      })
    }, 15000)
  }
})

onUnmounted(() => window.clearInterval(driverRefreshTimer))
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
        <section class="driver-desk" aria-label="Driver operations">
          <div class="driver-status-section">
            <div>
              <p class="eyebrow">Juba dispatch status</p>
              <h2><span class="availability-dot" :class="driverIsOnline ? 'is-online' : ''"></span>{{ driverStatusLabel }}</h2>
              <p class="plain-copy">{{ driverProfile?.name || authStore.user?.name }} · {{ driverProfile?.vehicle || 'Vehicle not set' }} · {{ driverProfile?.phone || 'Phone not set' }}</p>
            </div>
            <button class="button" :class="driverIsOnline ? 'button-secondary' : 'button-primary'" :disabled="submitting || loading || !!activeDriverRide" @click="toggleDriverAvailability">
              {{ submitting ? 'Saving…' : driverIsOnline ? 'Go offline' : 'Go online' }}
            </button>
          </div>
          <div class="driver-metrics" aria-label="Driver work summary">
            <div><span>New requests</span><strong>{{ driverRequests.length }}</strong></div>
            <div><span>Vehicle class</span><strong>{{ driverProfile?.vehicle || '—' }}</strong></div>
            <div><span>Driver rating</span><strong>{{ Number(driverProfile?.rating || 0).toFixed(1) }}</strong></div>
          </div>
        </section>

        <section v-if="activeDriverRide" class="data-section active-trip-section">
          <div class="section-heading"><div><p class="eyebrow">{{ activeDriverRide.status === 'In progress' ? 'Passenger on board' : 'Proceed to pickup' }}</p><h2>Current trip</h2></div><span class="status-label">{{ activeDriverRide.status }}</span></div>
          <div class="trip-route">
            <div><span class="route-marker pickup-marker"></span><div><span class="trip-label">Pickup</span><strong>{{ activeDriverRide.pickup }}</strong><small>{{ activeDriverRide.user?.name || 'Passenger' }}</small></div></div>
            <div><span class="route-marker destination-marker"></span><div><span class="trip-label">Drop-off</span><strong>{{ activeDriverRide.destination }}</strong><small>{{ formatDistance(activeDriverRide.distanceMeters) }} · {{ formatAmount(activeDriverRide.fare) }}</small></div></div>
          </div>
          <div class="trip-actions">
            <a class="button button-secondary" :href="pickupDirections(activeDriverRide)" target="_blank" rel="noopener noreferrer">Directions to pickup</a>
            <button v-if="activeDriverRide.status === 'Accepted'" class="button button-primary" :disabled="driverActionBusy" @click="startRide(activeDriverRide.id)">{{ driverActionBusy ? 'Updating…' : 'Start trip' }}</button>
            <button v-else class="button button-primary" :disabled="driverActionBusy" @click="completeRide(activeDriverRide.id)">{{ driverActionBusy ? 'Updating…' : 'Complete trip' }}</button>
          </div>
        </section>

        <section class="data-section">
          <div class="section-heading"><div><p class="eyebrow">Dispatch queue · {{ driverRequests.length }}</p><h2>Juba ride requests</h2></div><span class="plain-copy">Refreshes every 15 seconds</span></div>
          <div v-if="driverRequests.length" class="driver-request-grid">
            <article v-for="request in driverRequests" :key="request.id" class="driver-request">
              <div class="request-heading"><span class="request-type">{{ request.vehicleType }}</span><span class="request-fare">{{ formatAmount(request.fare) }}</span></div>
              <div class="trip-route request-route">
                <div><span class="route-marker pickup-marker"></span><div><span class="trip-label">Pickup</span><strong>{{ request.pickup }}</strong></div></div>
                <div><span class="route-marker destination-marker"></span><div><span class="trip-label">Drop-off</span><strong>{{ request.destination }}</strong></div></div>
              </div>
              <div class="request-footer"><span>{{ formatDistance(request.distanceMeters) }} · {{ formatDate(request.createdAt) }}</span><button class="button button-primary" :disabled="!driverIsOnline || !!activeDriverRide || driverActionBusy" @click="acceptRide(request.id)">{{ driverActionBusy ? 'Updating…' : 'Accept request' }}</button></div>
            </article>
          </div>
          <p v-else-if="!driverIsOnline" class="empty-state">Go online to receive matching Juba ride requests for your vehicle.</p>
          <p v-else class="empty-state">You’re online in Juba. No matching requests right now; keep the app open and new rides will appear here.</p>
        </section>
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
.driver-desk { padding: 14px 16px 8px; border: 1px solid rgba(244, 182, 61, 0.18); border-radius: 18px; background: linear-gradient(180deg, rgba(19, 33, 49, 0.96), rgba(11, 24, 36, 0.96)); box-shadow: 0 18px 40px rgba(4, 20, 31, 0.35); }
.driver-desk .driver-status-section { padding-bottom: 18px; border-bottom: 0; }
.driver-metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid var(--outline); }
.driver-metrics > div { min-width: 0; padding: 13px 16px 15px 0; }
.driver-metrics > div + div { padding-left: 16px; border-left: 1px solid var(--outline); }
.driver-metrics span, .driver-metrics strong { display: block; }
.driver-metrics span, .trip-label { color: var(--muted); font-size: 11px; }
.driver-metrics strong { margin-top: 5px; overflow-wrap: anywhere; font-size: 14px; }
.active-trip-section { border-bottom-color: var(--primary); }
.trip-route { display: grid; gap: 0; padding: 6px 0; }
.trip-route > div { position: relative; display: grid; grid-template-columns: 14px minmax(0, 1fr); gap: 12px; padding-bottom: 17px; }
.trip-route > div:last-child { padding-bottom: 0; }
.trip-route > div:first-child::after { position: absolute; top: 10px; bottom: 0; left: 4px; width: 1px; background: var(--outline); content: ''; }
.route-marker { z-index: 1; width: 9px; height: 9px; margin-top: 3px; border: 2px solid var(--surface-container); border-radius: 50%; background: var(--primary); }
.destination-marker { background: var(--secondary); }
.trip-route strong, .trip-route small { display: block; }
.trip-route strong { margin-top: 3px; font-size: 14px; font-weight: 600; }
.trip-route small { margin-top: 4px; color: var(--muted); font-size: 12px; }
.trip-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
.trip-actions .button { display: inline-flex; align-items: center; justify-content: center; text-decoration: none; }
.driver-request-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.driver-request { min-width: 0; padding: 16px; border: 1px solid rgba(244, 182, 61, 0.14); border-radius: 14px; background: linear-gradient(180deg, rgba(21, 45, 67, 0.95), rgba(13, 35, 55, 0.9)); box-shadow: 0 10px 24px rgba(2, 14, 24, 0.18); }
.request-heading, .request-footer { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.request-type { color: var(--muted); font-size: 12px; font-weight: 700; }
.request-fare { color: var(--primary-soft); font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; }
.request-route { padding: 16px 0; }
.request-footer { align-items: flex-end; padding-top: 12px; border-top: 1px solid var(--outline); }
.request-footer > span { color: var(--muted); font-size: 11px; line-height: 1.4; }
.request-footer .button { flex: 0 0 auto; }
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
  .driver-request-grid { grid-template-columns: 1fr; }
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
  .driver-status-section .button { width: 100%; }
  .driver-metrics > div { padding-right: 8px; }
  .driver-metrics > div + div { padding-left: 8px; }
  .trip-actions .button { flex: 1 1 100%; }
  .request-footer { align-items: stretch; flex-direction: column; }
  .request-footer .button { width: 100%; }
  table { min-width: 620px; }
}
</style>
