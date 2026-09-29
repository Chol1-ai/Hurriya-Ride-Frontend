<script setup>
defineProps({ balance: { type: String, default: 'SSP 0' } })
defineEmits(['top-up'])
</script>
<template><section class="wallet"><span class="eyebrow">Hurriya wallet</span><strong>{{ balance }}</strong><button @click="$emit('top-up')">Top up</button></section></template>
<style scoped>.wallet{display:grid;gap:10px;padding:18px;background:var(--surface-high);border:1px solid var(--outline);border-radius:12px}.wallet strong{font-size:28px;color:var(--primary-soft)}.wallet button{width:max-content;padding:10px 16px;border:0;border-radius:7px;background:var(--primary);color:#472a00;font-weight:700}</style>
