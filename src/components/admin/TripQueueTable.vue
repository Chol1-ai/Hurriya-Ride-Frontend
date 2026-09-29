<script setup>
defineProps({ trips: { type: Array, default: () => [] } })
</script>
<template><div class="queue"><div class="queue-head"><span>Trip queue</span><span>{{ trips.length }} active</span></div><div v-for="trip in trips" :key="trip.id" class="queue-row"><strong>#{{ trip.id }}</strong><span>{{ trip.route }}</span><em>{{ trip.status }}</em></div><p v-if="!trips.length">No active trips in the queue.</p></div></template>
<style scoped>.queue{padding:18px;background:var(--surface-low);border:1px solid var(--outline);border-radius:10px}.queue-head,.queue-row{display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--outline)}.queue-head{justify-content:space-between;color:var(--primary-soft);font-weight:700}.queue-row span{flex:1;color:var(--muted)}.queue-row em{color:var(--success);font-size:11px;font-style:normal;text-transform:uppercase}.queue p{color:var(--muted)}</style>
