<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({ role: { type: String, default: 'Passenger' } })

const linksByRole = {
  Admin: [
    { to: '/admin', label: 'Command center', icon: '⌘' },
    { to: '/accounts', label: 'Manage accounts', icon: '＋' },
    { to: '/drivers', label: 'Driver roster', icon: '✓' },
    { to: '/ledger', label: 'Revenue ledger', icon: '₤' },
  ],
  Fleet: [
    { to: '/fleet', label: 'Overview', icon: '▣' },
    { to: '/fleet/drivers', label: 'Drivers', icon: '◉' },
  ],
  Driver: [{ to: '/driver', label: 'Driver app', icon: '◉' }],
  Passenger: [
    { to: '/passenger', label: 'Book a ride', icon: '⌂' },
    { to: '/passenger/rides', label: 'Ride history', icon: '↗' },
    { to: '/passenger/wallet', label: 'Wallet', icon: '$' },
  ],
}

const links = computed(() => linksByRole[props.role] || linksByRole.Passenger)
</script>

<template>
  <aside class="sidebar">
    <div class="brand-mark">H</div><div class="brand-copy"><strong>Hurriya</strong><span>{{ role === 'Admin' ? 'Admin console' : 'Juba mobility' }}</span></div>
    <nav><RouterLink v-for="link in links" :key="link.to" :to="link.to"><b>{{ link.icon }}</b>{{ link.label }}</RouterLink></nav>
    <div class="sidebar-foot"><span class="status-dot"></span> Platform online<br /><small>SSP settlement active</small></div>
  </aside>
</template>
