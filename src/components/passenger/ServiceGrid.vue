<script setup>
defineProps({ services: { type: Array, default: () => ['Boda','Tuktuk','Car','XL','Delivery'] } })
defineEmits(['select'])
</script>
<template><div class="service-grid"><button v-for="service in services" :key="service" @click="$emit('select', service)">{{ service }}</button></div></template>
<style scoped>.service-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.service-grid button{padding:18px 12px;border:1px solid var(--outline);border-radius:10px;background:var(--surface-container);color:var(--on-surface);font-weight:700}.service-grid button:hover{border-color:var(--primary);color:var(--primary-soft)}</style>
