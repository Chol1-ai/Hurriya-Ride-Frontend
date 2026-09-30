<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import Sidebar from './components/common/Sidebar.vue'
import Navbar from './components/common/Navbar.vue'

const route = useRoute()
const authStore = useAuthStore()
const isPassenger = computed(() => route.path.startsWith('/passenger') || route.path.startsWith('/screen/') && route.path.includes('rider_'))
const isStandaloneRoute = computed(() => ['/', '/login', '/admin/login', '/driver/login', '/fleet/login'].includes(route.path))
const mobileLinksByRole = {
  Admin: [
    { to: '/admin', label: 'Overview' },
    { to: '/accounts', label: 'Accounts' },
    { to: '/drivers', label: 'Drivers' },
    { to: '/ledger', label: 'Ledger' },
  ],
  Fleet: [
    { to: '/fleet', label: 'Fleet' },
    { to: '/fleet/drivers', label: 'Drivers' },
  ],
  Driver: [{ to: '/driver', label: 'Driver' }],
  Passenger: [
    { to: '/passenger', label: 'Book' },
    { to: '/passenger/rides', label: 'Rides' },
    { to: '/passenger/wallet', label: 'Wallet' },
  ],
}
const mobileLinks = computed(() => mobileLinksByRole[authStore.role] || mobileLinksByRole.Passenger)
</script>

<template>
  <div v-if="isStandaloneRoute" class="auth-shell">
    <RouterView />
  </div>

  <div v-else class="app-shell" :class="{ 'passenger-shell': isPassenger, 'driver-shell': route.path === '/driver' }">
    <Sidebar :role="authStore.role" />
    <div class="app-main">
      <Navbar :role="isPassenger ? 'Passenger experience' : 'Hurriya operations'" />
      <main class="page-content"><RouterView /></main>
    </div>
    <nav class="mobile-nav" aria-label="Primary navigation">
      <RouterLink v-for="link in mobileLinks" :key="link.to" :to="link.to" exact-active-class="is-active">{{ link.label }}</RouterLink>
    </nav>
  </div>
</template>

<style>
.auth-shell { min-height: 100vh; }
.app-shell { min-height: 100vh; display: flex; background: var(--surface); }
.app-main { min-width: 0; flex: 1; }
.page-content { padding: 32px; }
.topbar { height: var(--header-height); display: flex; align-items: center; justify-content: space-between; padding: 0 32px; background: rgba(1,15,31,.8); border-bottom: 1px solid var(--outline); }
.topbar strong { display: block; font-size: 18px; }
.eyebrow { display: block; color: var(--muted); font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 4px; }
.connection { color: var(--success); font-size: 12px; font-weight: 700; }
.connection i, .status-dot { display: inline-block; width: 8px; height: 8px; margin-right: 7px; border-radius: 50%; background: currentColor; }
.sidebar { flex: 0 0 var(--sidebar-width); display: flex; flex-direction: column; gap: 28px; min-height: 100vh; padding: 24px 16px; background: var(--surface-lowest); border-right: 1px solid var(--outline); }
.brand-mark { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 12px; background: var(--primary); color: #472a00; font-size: 22px; font-weight: 800; }
.brand-copy { margin-top: -68px; margin-left: 54px; }
.brand-copy strong, .brand-copy span { display: block; }
.brand-copy strong { color: var(--primary-soft); font-size: 18px; }
.brand-copy span { color: var(--muted); font-size: 11px; }
.sidebar nav { display: grid; gap: 6px; margin-top: 24px; }
.sidebar nav a { display: flex; gap: 12px; align-items: center; padding: 13px 14px; color: var(--muted); border-left: 3px solid transparent; border-radius: 7px; font-size: 13px; font-weight: 700; }
.sidebar nav a:hover, .sidebar nav a.router-link-active { color: var(--primary-soft); background: var(--surface-high); border-left-color: var(--primary); }
.sidebar nav b { width: 20px; color: inherit; text-align: center; font-size: 16px; }
.sidebar-foot { margin-top: auto; padding: 14px; color: var(--success); background: var(--surface-low); border: 1px solid var(--outline); border-radius: 8px; font-size: 12px; font-weight: 700; }
.sidebar-foot small { color: var(--muted); font-weight: 400; }
.mobile-nav { display: none; }
@media (max-width: 767px) {
  .app-shell { display: block; }
  .sidebar { display: none; }
  .page-content { padding: 16px 16px calc(88px + env(safe-area-inset-bottom)); }
  .topbar { height: 68px; padding: 0 16px; }
  .mobile-nav { position: fixed; z-index: 30; right: 0; bottom: 0; left: 0; display: grid; grid-auto-columns: 1fr; grid-auto-flow: column; gap: 4px; padding: 7px 8px calc(7px + env(safe-area-inset-bottom)); border-top: 1px solid var(--outline); background: var(--surface-lowest); }
  .mobile-nav a { display: grid; min-height: 44px; place-items: center; color: var(--muted); font-size: 12px; font-weight: 700; text-decoration: none; }
  .mobile-nav a.is-active { color: var(--primary-soft); }
}
</style>
