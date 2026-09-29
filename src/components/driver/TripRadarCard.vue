<script setup>
defineProps({ request: { type: Object, default: () => ({ pickup: 'Munuki', dropoff: 'Airport', fare: 'SSP 4,500' }) } })
defineEmits(['accept','decline'])
</script>
<template><article class="trip-card"><span class="eyebrow">Incoming trip</span><h3>{{ request.pickup }} → {{ request.dropoff }}</h3><strong>{{ request.fare }}</strong><div><button @click="$emit('accept')">Accept</button><button @click="$emit('decline')">Decline</button></div></article></template>
<style scoped>.trip-card{padding:18px;background:var(--surface-low);border:1px solid var(--outline);border-radius:12px}.trip-card h3{margin:8px 0}.trip-card strong{color:var(--primary-soft)}.trip-card div{display:flex;gap:8px;margin-top:16px}.trip-card button{flex:1;padding:10px;border:1px solid var(--outline);border-radius:7px;background:var(--surface-container);color:var(--on-surface)}.trip-card button:first-child{background:var(--primary);color:#472a00;border-color:var(--primary);font-weight:700}</style>
