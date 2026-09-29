<script setup>
defineProps({ total: { type: Number, default: 0 }, commission: { type: Number, default: 15 } })
</script>
<template><section class="earnings"><span class="eyebrow">Net earnings</span><strong>SSP {{ total.toLocaleString() }}</strong><small>{{ commission }}% platform commission applied</small></section></template>
<style scoped>.earnings{display:grid;gap:8px;padding:18px;background:var(--surface-low);border:1px solid var(--outline);border-radius:12px}.earnings strong{font-size:26px;color:var(--primary-soft)}.earnings small{color:var(--muted)}</style>
